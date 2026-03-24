"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const cart_service_1 = require("../cart/cart.service");
const DEFAULT_CURRENCY = 'USD';
let OrderService = class OrderService {
    prisma;
    cartService;
    constructor(prisma, cartService) {
        this.prisma = prisma;
        this.cartService = cartService;
    }
    async listCustomerOrders(customerId, query) {
        const searchFilter = query.q
            ? {
                OR: [
                    {
                        orderNumber: {
                            contains: query.q,
                            mode: 'insensitive',
                        },
                    },
                    {
                        customer: {
                            email: {
                                contains: query.q,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            }
            : undefined;
        const statusFilter = query.status
            ? this.buildStatusFilter(query.status)
            : undefined;
        const orders = await this.prisma.order.findMany({
            where: {
                userId: customerId,
                AND: [searchFilter, statusFilter].filter(Boolean),
            },
            include: this.orderInclude(),
            orderBy: {
                createdAt: 'desc',
            },
        });
        const serialized = orders.map((order) => this.serializeOrder(order));
        return this.shouldPaginate(query) ? this.paginate(serialized, query) : serialized;
    }
    async listAdminOrders(query) {
        const searchFilter = query.q
            ? {
                OR: [
                    {
                        orderNumber: {
                            contains: query.q,
                            mode: 'insensitive',
                        },
                    },
                    {
                        customer: {
                            email: {
                                contains: query.q,
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        address: {
                            recipientName: {
                                contains: query.q,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            }
            : undefined;
        const statusFilter = query.status
            ? this.buildStatusFilter(query.status)
            : undefined;
        const orders = await this.prisma.order.findMany({
            where: {
                AND: [searchFilter, statusFilter].filter(Boolean),
            },
            include: this.orderInclude(),
            orderBy: {
                createdAt: 'desc',
            },
        });
        const serialized = orders.map((order) => this.serializeOrder(order));
        return this.paginate(serialized, query);
    }
    async getOrder(id, customerId) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: this.orderInclude(),
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found.');
        }
        if (customerId && order.userId !== customerId) {
            throw new common_1.NotFoundException('Order not found.');
        }
        return this.serializeOrder(order);
    }
    async createOrder(customerId, payload) {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found.');
        }
        const sourceItems = payload.cartId
            ? await this.extractItemsFromCart(payload.cartId, customerId)
            : await this.extractItemsFromPayload(payload.items ?? []);
        if (sourceItems.length === 0) {
            throw new common_1.BadRequestException('At least one checkout item is required.');
        }
        return this.prisma.$transaction(async (tx) => {
            const pricedItems = [];
            for (const sourceItem of sourceItems) {
                const variant = await tx.productVariant.findUnique({
                    where: { id: sourceItem.variantId },
                    include: {
                        product: {
                            include: {
                                translations: {
                                    where: {
                                        locale: 'zh',
                                    },
                                },
                                images: {
                                    orderBy: { position: 'asc' },
                                },
                            },
                        },
                        prices: true,
                        inventoryItem: true,
                    },
                });
                if (!variant || !variant.inventoryItem || !variant.product) {
                    throw new common_1.NotFoundException(`Variant ${sourceItem.variantId} not found.`);
                }
                const available = variant.inventoryItem.quantityOnHand - variant.inventoryItem.quantityReserved;
                if (available < sourceItem.quantity) {
                    throw new common_1.BadRequestException(`Insufficient inventory for ${variant.product.handle}.`);
                }
                const price = variant.prices.find((entry) => entry.currency === DEFAULT_CURRENCY) ??
                    variant.prices[0];
                if (!price) {
                    throw new common_1.BadRequestException(`Variant ${variant.id} does not have a valid price.`);
                }
                pricedItems.push({
                    productId: variant.product.id,
                    variantId: variant.id,
                    productHandle: variant.product.handle,
                    productTitle: variant.product.translations[0]?.title ?? variant.product.handle,
                    variantTitle: variant.title,
                    image: variant.product.images.find((image) => image.isPrimary)?.url ??
                        variant.product.images[0]?.url,
                    quantity: sourceItem.quantity,
                    unitPrice: price.amount,
                    totalPrice: price.amount.mul(sourceItem.quantity),
                    inventoryItemId: variant.inventoryItem.id,
                });
            }
            const subtotal = pricedItems.reduce((sum, item) => sum.add(item.totalPrice), new client_1.Prisma.Decimal(0));
            const shipping = subtotal.greaterThan(new client_1.Prisma.Decimal(80))
                ? new client_1.Prisma.Decimal(0)
                : new client_1.Prisma.Decimal(8);
            const tax = subtotal.mul(new client_1.Prisma.Decimal(0.08)).toDecimalPlaces(2);
            const total = subtotal.add(shipping).add(tax);
            const order = await tx.order.create({
                data: {
                    userId: customer.id,
                    orderNumber: this.generateOrderNumber(),
                    currency: DEFAULT_CURRENCY,
                    paymentStatus: client_1.PaymentStatus.PENDING,
                    orderStatus: client_1.OrderStatus.PENDING_PAYMENT,
                    subtotalAmount: subtotal,
                    shippingFee: shipping,
                    taxAmount: tax,
                    discountAmount: new client_1.Prisma.Decimal(0),
                    totalAmount: total,
                    paymentMethod: 'manual',
                },
            });
            if (payload.shippingAddress) {
                await tx.orderAddress.create({
                    data: {
                        orderId: order.id,
                        recipientName: `${payload.shippingAddress.firstName ?? ''} ${payload.shippingAddress.lastName ?? ''}`.trim() ||
                            `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() ||
                            customer.email,
                        email: customer.email,
                        phone: payload.shippingAddress.phone ?? customer.phone,
                        country: payload.shippingAddress.country,
                        province: payload.shippingAddress.province,
                        city: payload.shippingAddress.city,
                        addressLine1: payload.shippingAddress.address1,
                        addressLine2: payload.shippingAddress.address2,
                        postalCode: payload.shippingAddress.zip,
                    },
                });
            }
            for (const item of pricedItems) {
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: item.productId,
                        variantId: item.variantId,
                        productTitle: item.productTitle,
                        variantTitle: item.variantTitle,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                    },
                });
                await tx.inventoryItem.update({
                    where: { id: item.inventoryItemId },
                    data: {
                        quantityReserved: {
                            increment: item.quantity,
                        },
                    },
                });
                await tx.inventoryReservation.create({
                    data: {
                        inventoryItemId: item.inventoryItemId,
                        orderId: order.id,
                        quantity: item.quantity,
                    },
                });
                await tx.inventoryLedger.create({
                    data: {
                        inventoryItemId: item.inventoryItemId,
                        changeType: client_1.InventoryChangeType.RESERVE,
                        quantity: item.quantity,
                        referenceType: 'order',
                        referenceId: order.id,
                        reason: 'Order placed and inventory reserved.',
                    },
                });
            }
            await tx.orderLog.create({
                data: {
                    orderId: order.id,
                    action: 'order_created',
                    metadata: {
                        customerId,
                    },
                },
            });
            if (payload.cartId) {
                await tx.cartItem.deleteMany({
                    where: {
                        cartId: payload.cartId,
                    },
                });
                await tx.cart.update({
                    where: { id: payload.cartId },
                    data: {
                        updatedAt: new Date(),
                    },
                });
            }
            const createdOrder = await tx.order.findUnique({
                where: { id: order.id },
                include: this.orderInclude(),
            });
            if (!createdOrder) {
                throw new common_1.NotFoundException('Order not found after creation.');
            }
            return this.serializeOrder(createdOrder);
        });
    }
    async updateOrderStatus(id, payload) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                reservations: {
                    include: {
                        inventoryItem: true,
                    },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found.');
        }
        if (payload.status === 'processing') {
            await this.commitReservations(order.id);
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    orderStatus: client_1.OrderStatus.PROCESSING,
                    paymentStatus: client_1.PaymentStatus.PAID,
                    paidAt: order.paidAt ?? new Date(),
                },
            });
        }
        else if (payload.status === 'cancelled') {
            await this.releaseReservations(order.id);
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    orderStatus: client_1.OrderStatus.CANCELLED,
                },
            });
        }
        else if (payload.status === 'shipped') {
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    orderStatus: client_1.OrderStatus.SHIPPED,
                    shippedAt: new Date(),
                },
            });
        }
        else if (payload.status === 'delivered') {
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    orderStatus: client_1.OrderStatus.DELIVERED,
                    completedAt: new Date(),
                },
            });
        }
        else {
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    orderStatus: client_1.OrderStatus.PENDING_PAYMENT,
                },
            });
        }
        await this.prisma.orderLog.create({
            data: {
                orderId: order.id,
                action: 'status_updated',
                metadata: {
                    status: payload.status,
                },
            },
        });
        return this.getOrder(order.id);
    }
    async applyBulkAction(payload) {
        if (payload.action !== 'updateStatus' || !payload.status) {
            throw new common_1.BadRequestException('Only updateStatus is supported for orders.');
        }
        for (const id of payload.ids) {
            await this.updateOrderStatus(id, {
                status: payload.status,
            });
        }
        return { updated: payload.ids.length };
    }
    async createShipment(id, payload) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found.');
        }
        await this.prisma.shipment.create({
            data: {
                orderId: id,
                carrier: payload.carrier,
                trackingNumber: payload.trackingNumber,
                trackingUrl: payload.trackingUrl,
                status: client_1.ShipmentStatus.SHIPPED,
                shippedAt: new Date(),
            },
        });
        await this.prisma.order.update({
            where: { id },
            data: {
                orderStatus: client_1.OrderStatus.SHIPPED,
                shippedAt: new Date(),
            },
        });
        await this.prisma.orderLog.create({
            data: {
                orderId: id,
                action: 'shipment_created',
                metadata: {
                    carrier: payload.carrier,
                    trackingNumber: payload.trackingNumber,
                    trackingUrl: payload.trackingUrl ?? null,
                },
            },
        });
        return this.getOrder(id);
    }
    async createReturn(id, payload) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found.');
        }
        const returnRequest = await this.prisma.returnRequest.create({
            data: {
                orderId: id,
                status: client_1.ReturnStatus.REQUESTED,
                reason: payload.reason,
            },
        });
        await this.prisma.order.update({
            where: { id },
            data: {
                orderStatus: client_1.OrderStatus.RETURN_REQUESTED,
            },
        });
        await this.prisma.orderLog.create({
            data: {
                orderId: id,
                action: 'return_requested',
                metadata: {
                    reason: payload.reason,
                },
            },
        });
        return {
            id: returnRequest.id,
            orderId: id,
            status: 'requested',
            reason: payload.reason,
            createdAt: returnRequest.createdAt.toISOString(),
        };
    }
    async commitReservations(orderId) {
        await this.prisma.$transaction(async (tx) => {
            const reservations = await tx.inventoryReservation.findMany({
                where: { orderId },
                include: {
                    inventoryItem: true,
                },
            });
            for (const reservation of reservations) {
                await tx.inventoryItem.update({
                    where: { id: reservation.inventoryItemId },
                    data: {
                        quantityOnHand: {
                            decrement: reservation.quantity,
                        },
                        quantityReserved: {
                            decrement: reservation.quantity,
                        },
                    },
                });
                await tx.inventoryLedger.create({
                    data: {
                        inventoryItemId: reservation.inventoryItemId,
                        changeType: client_1.InventoryChangeType.COMMIT,
                        quantity: reservation.quantity,
                        referenceType: 'order',
                        referenceId: orderId,
                        reason: 'Order payment confirmed and inventory committed.',
                    },
                });
            }
            await tx.inventoryReservation.deleteMany({
                where: { orderId },
            });
        });
    }
    async releaseReservations(orderId) {
        await this.prisma.$transaction(async (tx) => {
            const reservations = await tx.inventoryReservation.findMany({
                where: { orderId },
                include: {
                    inventoryItem: true,
                },
            });
            for (const reservation of reservations) {
                await tx.inventoryItem.update({
                    where: { id: reservation.inventoryItemId },
                    data: {
                        quantityReserved: {
                            decrement: reservation.quantity,
                        },
                    },
                });
                await tx.inventoryLedger.create({
                    data: {
                        inventoryItemId: reservation.inventoryItemId,
                        changeType: client_1.InventoryChangeType.RELEASE,
                        quantity: reservation.quantity,
                        referenceType: 'order',
                        referenceId: orderId,
                        reason: 'Order cancelled and reservation released.',
                    },
                });
            }
            await tx.inventoryReservation.deleteMany({
                where: { orderId },
            });
        });
    }
    async extractItemsFromCart(cartId, customerId) {
        const cart = await this.prisma.cart.findUnique({
            where: { id: cartId },
            include: {
                items: true,
            },
        });
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found.');
        }
        if (cart.customerId && cart.customerId !== customerId) {
            throw new common_1.BadRequestException('Cart belongs to a different customer.');
        }
        if (!cart.customerId) {
            await this.prisma.cart.update({
                where: { id: cartId },
                data: {
                    customerId,
                },
            });
        }
        return cart.items
            .filter((item) => item.variantId)
            .map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
        }));
    }
    async extractItemsFromPayload(items) {
        const resolvedItems = [];
        for (const item of items) {
            const quantity = Number.parseInt(item.quantity, 10) || 1;
            const variant = await this.resolveVariant(item.productId);
            resolvedItems.push({
                variantId: variant.id,
                quantity,
            });
        }
        return resolvedItems;
    }
    async resolveVariant(productOrVariantId) {
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: productOrVariantId },
        });
        if (variant) {
            return variant;
        }
        const product = await this.prisma.product.findUnique({
            where: { id: productOrVariantId },
            include: {
                variants: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!product || product.variants.length === 0) {
            throw new common_1.NotFoundException(`Product ${productOrVariantId} not found.`);
        }
        return product.variants[0];
    }
    orderInclude() {
        return {
            customer: true,
            address: true,
            items: {
                include: {
                    product: {
                        include: {
                            images: {
                                orderBy: { position: 'asc' },
                            },
                        },
                    },
                    variant: true,
                },
            },
            shipments: true,
            notes: true,
            logs: true,
            returns: true,
            refunds: true,
        };
    }
    serializeOrder(order) {
        const customerName = order.address?.recipientName ||
            `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim() ||
            undefined;
        const status = this.fromPrismaOrderStatus(order.orderStatus, order.paymentStatus);
        const items = order.items.map((item) => ({
            id: item.id,
            title: item.productTitle,
            quantity: item.quantity,
            price: Number(item.unitPrice),
            image: item.product?.images.find((image) => image.isPrimary)?.url ??
                item.product?.images[0]?.url,
        }));
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            customerName,
            customerEmail: order.customer?.email ?? order.address?.email ?? undefined,
            customerPhone: order.address?.phone ?? order.customer?.phone ?? undefined,
            shippingAddress: order.address
                ? {
                    address1: order.address.addressLine1,
                    address2: order.address.addressLine2 ?? undefined,
                    city: order.address.city,
                    province: order.address.province ?? '',
                    zip: order.address.postalCode ?? '',
                    country: order.address.country,
                }
                : undefined,
            subtotal: Number(order.subtotalAmount),
            shipping: Number(order.shippingFee),
            tax: Number(order.taxAmount),
            total: Number(order.totalAmount),
            status,
            createdAt: order.createdAt.toISOString(),
            items,
            totalPrice: {
                amount: Number(order.totalAmount).toFixed(2),
                currencyCode: order.currency,
            },
            lineItems: order.items.map((item) => ({
                id: item.id,
                title: item.productTitle,
                quantity: item.quantity,
                variant: {
                    id: item.variantId ?? item.productId ?? item.id,
                    title: item.variantTitle ?? 'Default',
                    price: {
                        amount: Number(item.unitPrice).toFixed(2),
                        currencyCode: order.currency,
                    },
                },
                product: {
                    id: item.productId ?? item.id,
                    handle: item.product?.handle ?? '',
                    title: item.productTitle,
                    featuredImage: item.product?.images?.length
                        ? {
                            url: item.product.images.find((image) => image.isPrimary)?.url ??
                                item.product.images[0].url,
                            altText: '',
                            width: 800,
                            height: 800,
                        }
                        : null,
                },
            })),
        };
    }
    fromPrismaOrderStatus(orderStatus, paymentStatus) {
        if (orderStatus === client_1.OrderStatus.CANCELLED) {
            return 'cancelled';
        }
        if (orderStatus === client_1.OrderStatus.SHIPPED) {
            return 'shipped';
        }
        if (orderStatus === client_1.OrderStatus.DELIVERED ||
            orderStatus === client_1.OrderStatus.COMPLETED) {
            return 'delivered';
        }
        if (paymentStatus === client_1.PaymentStatus.PAID ||
            orderStatus === client_1.OrderStatus.PAID ||
            orderStatus === client_1.OrderStatus.PROCESSING) {
            return 'processing';
        }
        return 'pending';
    }
    buildStatusFilter(status) {
        switch (status) {
            case 'pending':
                return {
                    orderStatus: client_1.OrderStatus.PENDING_PAYMENT,
                };
            case 'processing':
                return {
                    OR: [
                        { orderStatus: client_1.OrderStatus.PAID },
                        { orderStatus: client_1.OrderStatus.PROCESSING },
                    ],
                };
            case 'shipped':
                return {
                    orderStatus: client_1.OrderStatus.SHIPPED,
                };
            case 'delivered':
                return {
                    OR: [
                        { orderStatus: client_1.OrderStatus.DELIVERED },
                        { orderStatus: client_1.OrderStatus.COMPLETED },
                    ],
                };
            case 'cancelled':
                return {
                    orderStatus: client_1.OrderStatus.CANCELLED,
                };
            default:
                return {};
        }
    }
    shouldPaginate(query) {
        return typeof query.page === 'number' || typeof query.pageSize === 'number';
    }
    paginate(items, query) {
        const page = Math.max(1, query.page ?? 1);
        const pageSize = Math.max(1, query.pageSize ?? 20);
        const start = (page - 1) * pageSize;
        return {
            items: items.slice(start, start + pageSize),
            total: items.length,
            page,
            pageSize,
        };
    }
    generateOrderNumber() {
        const now = new Date();
        const timestamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}`;
        const random = Math.floor(Math.random() * 9000 + 1000);
        return `CS${timestamp}${random}`;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cart_service_1.CartService])
], OrderService);
//# sourceMappingURL=order.service.js.map