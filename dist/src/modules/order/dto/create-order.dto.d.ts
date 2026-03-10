declare class CheckoutItemDto {
    productId: string;
    quantity: string;
}
declare class ShippingAddressDto {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
}
export declare class CreateOrderDto {
    cartId?: string;
    items?: CheckoutItemDto[];
    customerEmail?: string;
    customerName?: string;
    shippingAddress?: ShippingAddressDto;
}
export {};
