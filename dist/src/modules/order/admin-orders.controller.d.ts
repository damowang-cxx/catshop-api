import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { CreateReturnDto } from './dto/create-return.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderService } from './order.service';
export declare class AdminOrdersController {
    private readonly orderService;
    constructor(orderService: OrderService);
    listOrders(query: OrderQueryDto): Promise<{
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
    bulkUpdateOrders(payload: BulkActionRequestDto): Promise<{
        updated: number;
    }>;
    getOrder(id: string): Promise<{
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
}
