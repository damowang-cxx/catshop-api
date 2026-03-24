export type ProductStatus = 'draft' | 'active' | 'scheduled' | 'archived';
export type CollectionStatus = 'active' | 'hidden';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export interface ImageRecord {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
}
export interface VariantRecord {
    id: string;
    title: string;
    price: {
        amount: string;
        currencyCode: string;
    };
    availableForSale: boolean;
    selectedOptions: Array<{
        name: string;
        value: string;
    }>;
}
export interface BrandRecord {
    id: string;
    name: string;
    handle: string;
    description?: string;
    logo?: string;
}
export interface CollectionRecord {
    id: string;
    title: string;
    handle: string;
    description?: string;
    image?: string;
    status: CollectionStatus;
    productCount?: number;
    updatedAt: string;
}
export interface ProductRecord {
    id: string;
    title: string;
    handle: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    inventory: number;
    status: ProductStatus;
    images: ImageRecord[];
    featuredImage?: ImageRecord | null;
    primaryImageIndex: number;
    availableForSale: boolean;
    brandId?: string;
    collectionIds: string[];
    tags: string[];
    options: Array<{
        id: string;
        name: string;
        values: string[];
    }>;
    variants: VariantRecord[];
    recommendationIds: string[];
    createdAt: string;
    updatedAt: string;
}
export interface CustomerRecord {
    id: string;
    email: string;
    passwordHash: string;
    authProvider?: 'local' | 'google';
    googleSub?: string;
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    status: 'active' | 'locked';
    lastLoginAt?: string;
}
export interface AdminRecord {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    lastLoginAt?: string;
}
export interface AddressRecord {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
}
export interface OrderItemRecord {
    id: string;
    productId: string;
    productHandle: string;
    productTitle: string;
    image?: string;
    quantity: number;
    price: number;
}
export interface OrderRecord {
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
    status: OrderStatus;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    shippingAddress?: AddressRecord;
    items: OrderItemRecord[];
    notes: string[];
    logs: string[];
    createdAt: string;
    updatedAt: string;
}
export interface CartLineRecord {
    id: string;
    merchandiseId: string;
    quantity: number;
    productId: string;
}
export interface CartRecord {
    id: string;
    items: CartLineRecord[];
    currencyCode: string;
    createdAt: string;
    updatedAt: string;
}
export interface PageRecord {
    id: string;
    handle: string;
    title: string;
    body: string;
    seoTitle?: string;
    seoDescription?: string;
}
export interface MenuRecord {
    id: string;
    handle: string;
    title: string;
    items: Array<{
        title: string;
        path: string;
    }>;
}
