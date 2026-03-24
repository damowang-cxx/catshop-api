declare class ProductOptionDto {
    name: string;
    position?: number;
    values: string[];
}
declare class ProductVariantOptionValueDto {
    name: string;
    value: string;
}
declare class ProductVariantPriceDto {
    currency: string;
    market?: string;
    amount: number;
}
declare class ProductVariantDto {
    sku: string;
    title: string;
    barcode?: string;
    compareAtPrice?: number;
    inventory: number;
    prices: ProductVariantPriceDto[];
    selectedOptions?: ProductVariantOptionValueDto[];
}
export declare class CreateProductDto {
    sku?: string;
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
    brandId?: string;
    categoryIds?: string[];
    options?: ProductOptionDto[];
    variants?: ProductVariantDto[];
}
export {};
