import type { FastifyRequest } from 'fastify';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderService } from './order.service';
export declare class OrdersController {
    private readonly orderService;
    constructor(orderService: OrderService);
    listOrders(request: FastifyRequest & {
        customer: {
            id: string;
        };
    }, query: OrderQueryDto): Promise<{
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
    } | {
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
    }[]>;
    createOrder(request: FastifyRequest & {
        customer: {
            id: string;
        };
    }, payload: CreateOrderDto): Promise<{
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
    getOrder(request: FastifyRequest & {
        customer: {
            id: string;
        };
    }, id: string): Promise<{
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
}
