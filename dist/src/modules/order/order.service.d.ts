import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { MockDatabaseService } from '../../shared/mock-database.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateReturnDto } from './dto/create-return.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrderService {
    private readonly mockDb;
    private readonly cartService;
    constructor(mockDb: MockDatabaseService, cartService: CartService);
    listOrders(query: OrderQueryDto, adminView?: boolean): {
        totalPrice: {
            amount: string;
            currencyCode: string;
        };
        lineItems: {
            id: string;
            title: string;
            quantity: number;
            variant: {
                id: string;
                title: string;
                price: {
                    amount: string;
                    currencyCode: string;
                };
            };
            product: {
                id: string;
                handle: string;
                title: string;
                featuredImage: {
                    url: string;
                } | null;
            };
        }[];
        id: string;
        orderNumber: string;
        customerId?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        currencyCode: string;
        status: import("../../common/types/domain.types").OrderStatus;
        paymentStatus: "pending" | "paid" | "refunded";
        shippingAddress?: import("../../common/types/domain.types").AddressRecord;
        items: import("../../common/types/domain.types").OrderItemRecord[];
        notes: string[];
        logs: string[];
        createdAt: string;
        updatedAt: string;
    }[] | import("../../common/utils/pagination").PaginatedResponse<{
        totalPrice: {
            amount: string;
            currencyCode: string;
        };
        lineItems: {
            id: string;
            title: string;
            quantity: number;
            variant: {
                id: string;
                title: string;
                price: {
                    amount: string;
                    currencyCode: string;
                };
            };
            product: {
                id: string;
                handle: string;
                title: string;
                featuredImage: {
                    url: string;
                } | null;
            };
        }[];
        id: string;
        orderNumber: string;
        customerId?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        currencyCode: string;
        status: import("../../common/types/domain.types").OrderStatus;
        paymentStatus: "pending" | "paid" | "refunded";
        shippingAddress?: import("../../common/types/domain.types").AddressRecord;
        items: import("../../common/types/domain.types").OrderItemRecord[];
        notes: string[];
        logs: string[];
        createdAt: string;
        updatedAt: string;
    }>;
    getOrder(id: string): {
        totalPrice: {
            amount: string;
            currencyCode: string;
        };
        lineItems: {
            id: string;
            title: string;
            quantity: number;
            variant: {
                id: string;
                title: string;
                price: {
                    amount: string;
                    currencyCode: string;
                };
            };
            product: {
                id: string;
                handle: string;
                title: string;
                featuredImage: {
                    url: string;
                } | null;
            };
        }[];
        id: string;
        orderNumber: string;
        customerId?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        currencyCode: string;
        status: import("../../common/types/domain.types").OrderStatus;
        paymentStatus: "pending" | "paid" | "refunded";
        shippingAddress?: import("../../common/types/domain.types").AddressRecord;
        items: import("../../common/types/domain.types").OrderItemRecord[];
        notes: string[];
        logs: string[];
        createdAt: string;
        updatedAt: string;
    };
    createOrder(payload: CreateOrderDto): {
        totalPrice: {
            amount: string;
            currencyCode: string;
        };
        lineItems: {
            id: string;
            title: string;
            quantity: number;
            variant: {
                id: string;
                title: string;
                price: {
                    amount: string;
                    currencyCode: string;
                };
            };
            product: {
                id: string;
                handle: string;
                title: string;
                featuredImage: {
                    url: string;
                } | null;
            };
        }[];
        id: string;
        orderNumber: string;
        customerId?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        currencyCode: string;
        status: import("../../common/types/domain.types").OrderStatus;
        paymentStatus: "pending" | "paid" | "refunded";
        shippingAddress?: import("../../common/types/domain.types").AddressRecord;
        items: import("../../common/types/domain.types").OrderItemRecord[];
        notes: string[];
        logs: string[];
        createdAt: string;
        updatedAt: string;
    };
    updateOrderStatus(id: string, payload: UpdateOrderStatusDto): {
        totalPrice: {
            amount: string;
            currencyCode: string;
        };
        lineItems: {
            id: string;
            title: string;
            quantity: number;
            variant: {
                id: string;
                title: string;
                price: {
                    amount: string;
                    currencyCode: string;
                };
            };
            product: {
                id: string;
                handle: string;
                title: string;
                featuredImage: {
                    url: string;
                } | null;
            };
        }[];
        id: string;
        orderNumber: string;
        customerId?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        currencyCode: string;
        status: import("../../common/types/domain.types").OrderStatus;
        paymentStatus: "pending" | "paid" | "refunded";
        shippingAddress?: import("../../common/types/domain.types").AddressRecord;
        items: import("../../common/types/domain.types").OrderItemRecord[];
        notes: string[];
        logs: string[];
        createdAt: string;
        updatedAt: string;
    };
    applyBulkAction(payload: BulkActionRequestDto): {
        updated: number;
    };
    createShipment(id: string, payload: CreateShipmentDto): {
        totalPrice: {
            amount: string;
            currencyCode: string;
        };
        lineItems: {
            id: string;
            title: string;
            quantity: number;
            variant: {
                id: string;
                title: string;
                price: {
                    amount: string;
                    currencyCode: string;
                };
            };
            product: {
                id: string;
                handle: string;
                title: string;
                featuredImage: {
                    url: string;
                } | null;
            };
        }[];
        id: string;
        orderNumber: string;
        customerId?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        currencyCode: string;
        status: import("../../common/types/domain.types").OrderStatus;
        paymentStatus: "pending" | "paid" | "refunded";
        shippingAddress?: import("../../common/types/domain.types").AddressRecord;
        items: import("../../common/types/domain.types").OrderItemRecord[];
        notes: string[];
        logs: string[];
        createdAt: string;
        updatedAt: string;
    };
    createReturn(id: string, payload: CreateReturnDto): {
        id: string;
        orderId: string;
        status: string;
        reason: string;
        createdAt: string;
    };
    private serializeOrder;
    private findOrder;
    private extractItemsFromCart;
}
