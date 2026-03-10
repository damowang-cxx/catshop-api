export declare class CreateProductDto {
    title: string;
    handle: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    inventory: number;
    status?: string;
    images?: string[];
    primaryImageIndex?: number;
    featuredImage?: string;
}
