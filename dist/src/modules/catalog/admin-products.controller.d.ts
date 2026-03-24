import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class AdminProductsController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listProducts(query: ProductQueryDto): Promise<import("../../common/utils/pagination").PaginatedResponse<any>>;
    createProduct(payload: CreateProductDto): Promise<{
        id: any;
        sku: any;
        title: any;
        handle: any;
        description: any;
        price: number;
        compareAtPrice: number | undefined;
        inventory: any;
        status: string;
        images: any;
        featuredImage: any;
        primaryImageIndex: number;
        brandId: any;
        categoryIds: any;
        options: any;
        variants: any;
        updatedAt: any;
    }>;
    bulkProducts(payload: BulkActionRequestDto): Promise<{
        updated: number;
    }>;
    getProduct(idOrHandle: string): Promise<{
        id: any;
        sku: any;
        title: any;
        handle: any;
        description: any;
        price: number;
        compareAtPrice: number | undefined;
        inventory: any;
        status: string;
        images: any;
        featuredImage: any;
        primaryImageIndex: number;
        brandId: any;
        categoryIds: any;
        options: any;
        variants: any;
        updatedAt: any;
    }>;
    updateProduct(id: string, payload: Partial<CreateProductDto>): Promise<{
        id: any;
        sku: any;
        title: any;
        handle: any;
        description: any;
        price: number;
        compareAtPrice: number | undefined;
        inventory: any;
        status: string;
        images: any;
        featuredImage: any;
        primaryImageIndex: number;
        brandId: any;
        categoryIds: any;
        options: any;
        variants: any;
        updatedAt: any;
    }>;
    deleteProduct(id: string): Promise<{
        id: string;
    }>;
}
