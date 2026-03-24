declare class CheckoutItemDto {
    productId: string;
    quantity: string;
}
declare class ShippingAddressDto {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
    phone?: string;
}
export declare class CreateOrderDto {
    cartId?: string;
    items?: CheckoutItemDto[];
    customerEmail?: string;
    customerName?: string;
    shippingAddress?: ShippingAddressDto;
}
export {};
