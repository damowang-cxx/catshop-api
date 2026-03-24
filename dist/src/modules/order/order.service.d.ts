import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateReturnDto } from './dto/create-return.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrderService {
    private readonly prisma;
    private readonly cartService;
    constructor(prisma: PrismaService, cartService: CartService);
    listCustomerOrders(customerId: string, query: OrderQueryDto): Promise<{
        id: any;
        orderNumber: any;
        customerName: any;
        customerEmail: any;
        customerPhone: any;
        shippingAddress: {
            address1: any;
            address2: any;
            city: any;
            province: any;
            zip: any;
            country: any;
        } | undefined;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        status: string;
        createdAt: any;
        items: any;
        totalPrice: {
            amount: string;
            currencyCode: any;
        };
        lineItems: any;
    }[] | {
        items: {
            id: any;
            orderNumber: any;
            customerName: any;
            customerEmail: any;
            customerPhone: any;
            shippingAddress: {
                address1: any;
                address2: any;
                city: any;
                province: any;
                zip: any;
                country: any;
            } | undefined;
            subtotal: number;
            shipping: number;
            tax: number;
            total: number;
            status: string;
            createdAt: any;
            items: any;
            totalPrice: {
                amount: string;
                currencyCode: any;
            };
            lineItems: any;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    listAdminOrders(query: OrderQueryDto): Promise<{
        items: {
            id: any;
            orderNumber: any;
            customerName: any;
            customerEmail: any;
            customerPhone: any;
            shippingAddress: {
                address1: any;
                address2: any;
                city: any;
                province: any;
                zip: any;
                country: any;
            } | undefined;
            subtotal: number;
            shipping: number;
            tax: number;
            total: number;
            status: string;
            createdAt: any;
            items: any;
            totalPrice: {
                amount: string;
                currencyCode: any;
            };
            lineItems: any;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    getOrder(id: string, customerId?: string): Promise<{
        id: any;
        orderNumber: any;
        customerName: any;
        customerEmail: any;
        customerPhone: any;
        shippingAddress: {
            address1: any;
            address2: any;
            city: any;
            province: any;
            zip: any;
            country: any;
        } | undefined;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        status: string;
        createdAt: any;
        items: any;
        totalPrice: {
            amount: string;
            currencyCode: any;
        };
        lineItems: any;
    }>;
    createOrder(customerId: string, payload: CreateOrderDto): Promise<{
        id: any;
        orderNumber: any;
        customerName: any;
        customerEmail: any;
        customerPhone: any;
        shippingAddress: {
            address1: any;
            address2: any;
            city: any;
            province: any;
            zip: any;
            country: any;
        } | undefined;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        status: string;
        createdAt: any;
        items: any;
        totalPrice: {
            amount: string;
            currencyCode: any;
        };
        lineItems: any;
    }>;
    updateOrderStatus(id: string, payload: UpdateOrderStatusDto): Promise<{
        id: any;
        orderNumber: any;
        customerName: any;
        customerEmail: any;
        customerPhone: any;
        shippingAddress: {
            address1: any;
            address2: any;
            city: any;
            province: any;
            zip: any;
            country: any;
        } | undefined;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        status: string;
        createdAt: any;
        items: any;
        totalPrice: {
            amount: string;
            currencyCode: any;
        };
        lineItems: any;
    }>;
    applyBulkAction(payload: BulkActionRequestDto): Promise<{
        updated: number;
    }>;
    createShipment(id: string, payload: CreateShipmentDto): Promise<{
        id: any;
        orderNumber: any;
        customerName: any;
        customerEmail: any;
        customerPhone: any;
        shippingAddress: {
            address1: any;
            address2: any;
            city: any;
            province: any;
            zip: any;
            country: any;
        } | undefined;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        status: string;
        createdAt: any;
        items: any;
        totalPrice: {
            amount: string;
            currencyCode: any;
        };
        lineItems: any;
    }>;
    createReturn(id: string, payload: CreateReturnDto): Promise<{
        id: string;
        orderId: string;
        status: string;
        reason: string;
        createdAt: string;
    }>;
    private commitReservations;
    private releaseReservations;
    private extractItemsFromCart;
    private extractItemsFromPayload;
    private resolveVariant;
    private orderInclude;
    private serializeOrder;
    private fromPrismaOrderStatus;
    private buildStatusFilter;
    private shouldPaginate;
    private paginate;
    private generateOrderNumber;
}
