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
const pagination_1 = require("../../common/utils/pagination");
const mock_database_service_1 = require("../../shared/mock-database.service");
const cart_service_1 = require("../cart/cart.service");
let OrderService = class OrderService {
    mockDb;
    cartService;
    constructor(mockDb, cartService) {
        this.mockDb = mockDb;
        this.cartService = cartService;
    }
    listOrders(query, adminView = false) {
        let orders = [...this.mockDb.orders];
        if (query.q) {
            const keyword = query.q.toLowerCase();
            orders = orders.filter((order) => order.orderNumber.toLowerCase().includes(keyword) ||
                order.customerName?.toLowerCase().includes(keyword) ||
                order.customerEmail?.toLowerCase().includes(keyword));
        }
        if (query.status) {
            orders = orders.filter((order) => order.status === query.status);
        }
        orders.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
        if (!adminView) {
            return orders.map((order) => this.serializeOrder(order.id));
        }
        return (0, pagination_1.paginate)(orders.map((order) => this.serializeOrder(order.id)), query);
    }
    getOrder(id) {
        return this.serializeOrder(id);
    }
    createOrder(payload) {
        const sourceItems = payload.cartId
            ? this.extractItemsFromCart(payload.cartId)
            : payload.items?.map((item) => ({
                productId: item.productId,
                quantity: Number.parseInt(item.quantity, 10) || 1,
            })) ?? [];
        if (sourceItems.length === 0) {
            throw new common_1.BadRequestException('At least one checkout item is required.');
        }
        const items = sourceItems.map((item) => {
            const product = this.mockDb.products.find((candidate) => candidate.id === item.productId);
            if (!product) {
                throw new common_1.NotFoundException(`Product ${item.productId} not found.`);
            }
            if (product.inventory < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient inventory for ${product.title}.`);
            }
            product.inventory -= item.quantity;
            product.updatedAt = new Date().toISOString();
            return {
                id: this.mockDb.createId('item'),
                productId: product.id,
                productHandle: product.handle,
                productTitle: product.title,
                image: product.featuredImage?.url,
                quantity: item.quantity,
                price: product.price,
            };
        });
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = subtotal > 80 ? 0 : 8;
        const tax = Number((subtotal * 0.08).toFixed(2));
        const now = new Date().toISOString();
        const order = {
            id: this.mockDb.createId('ord'),
            orderNumber: `${1000 + this.mockDb.orders.length + 1}`,
            customerName: payload.customerName ?? 'Guest Checkout',
            customerEmail: payload.customerEmail,
            subtotal,
            shipping,
            tax,
            total: Number((subtotal + shipping + tax).toFixed(2)),
            currencyCode: 'USD',
            status: 'pending',
            paymentStatus: 'pending',
            shippingAddress: payload.shippingAddress,
            items,
            notes: [],
            logs: [`${now} system created order.`],
            createdAt: now,
            updatedAt: now,
        };
        this.mockDb.orders.unshift(order);
        return this.serializeOrder(order.id);
    }
    updateOrderStatus(id, payload) {
        const order = this.findOrder(id);
        order.status = payload.status;
        order.updatedAt = new Date().toISOString();
        order.logs.unshift(`${new Date().toISOString()} admin updated order status to ${payload.status}.`);
        return this.serializeOrder(id);
    }
    applyBulkAction(payload) {
        if (payload.action !== 'updateStatus' || !payload.status) {
            throw new common_1.BadRequestException('Only updateStatus is supported for orders.');
        }
        payload.ids.forEach((id) => {
            const order = this.findOrder(id);
            order.status = payload.status;
            order.updatedAt = new Date().toISOString();
            order.logs.unshift(`${new Date().toISOString()} admin bulk updated order status to ${payload.status}.`);
        });
        return { updated: payload.ids.length };
    }
    createShipment(id, payload) {
        const order = this.findOrder(id);
        order.status = 'shipped';
        order.updatedAt = new Date().toISOString();
        order.logs.unshift(`${new Date().toISOString()} admin created shipment ${payload.trackingNumber} via ${payload.carrier}.`);
        return this.serializeOrder(id);
    }
    createReturn(id, payload) {
        const order = this.findOrder(id);
        order.updatedAt = new Date().toISOString();
        order.logs.unshift(`${new Date().toISOString()} admin created return request: ${payload.reason}.`);
        return {
            id: this.mockDb.createId('ret'),
            orderId: id,
            status: 'requested',
            reason: payload.reason,
            createdAt: new Date().toISOString(),
        };
    }
    serializeOrder(id) {
        const order = this.findOrder(id);
        return {
            ...order,
            totalPrice: {
                amount: order.total.toFixed(2),
                currencyCode: order.currencyCode,
            },
            lineItems: order.items.map((item) => ({
                id: item.id,
                title: item.productTitle,
                quantity: item.quantity,
                variant: {
                    id: item.productId,
                    title: 'Default',
                    price: {
                        amount: item.price.toFixed(2),
                        currencyCode: order.currencyCode,
                    },
                },
                product: {
                    id: item.productId,
                    handle: item.productHandle,
                    title: item.productTitle,
                    featuredImage: item.image ? { url: item.image } : null,
                },
            })),
        };
    }
    findOrder(id) {
        const order = this.mockDb.orders.find((candidate) => candidate.id === id);
        if (!order) {
            throw new common_1.NotFoundException('Order not found.');
        }
        return order;
    }
    extractItemsFromCart(cartId) {
        const cart = this.cartService.getCart(cartId);
        return cart.lines.map((line) => ({
            productId: line.merchandise.product?.id ?? '',
            quantity: line.quantity,
        }));
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_database_service_1.MockDatabaseService,
        cart_service_1.CartService])
], OrderService);
//# sourceMappingURL=order.service.js.map