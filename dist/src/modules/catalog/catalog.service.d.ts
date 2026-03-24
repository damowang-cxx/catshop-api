import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class CatalogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listPublicProducts(query: ProductQueryDto): Promise<any[] | import("../../common/utils/pagination").PaginatedResponse<any>>;
    listAdminProducts(query: ProductQueryDto): Promise<import("../../common/utils/pagination").PaginatedResponse<any>>;
    getPublicProduct(idOrHandle: string): Promise<{
        id: any;
        handle: any;
        availableForSale: any;
        title: any;
        description: any;
        descriptionHtml: any;
        options: any;
        priceRange: {
            minVariantPrice: {
                amount: string;
                currencyCode: string;
            };
            maxVariantPrice: {
                amount: string;
                currencyCode: string;
            };
        };
        variants: any;
        featuredImage: any;
        images: any;
        seo: {
            title: any;
            description: any;
        };
        tags: never[];
        updatedAt: any;
    }>;
    getAdminProduct(idOrHandle: string): Promise<{
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
    getProductRecommendations(idOrHandle: string): Promise<{
        id: any;
        handle: any;
        availableForSale: any;
        title: any;
        description: any;
        descriptionHtml: any;
        options: any;
        priceRange: {
            minVariantPrice: {
                amount: string;
                currencyCode: string;
            };
            maxVariantPrice: {
                amount: string;
                currencyCode: string;
            };
        };
        variants: any;
        featuredImage: any;
        images: any;
        seo: {
            title: any;
            description: any;
        };
        tags: never[];
        updatedAt: any;
    }[]>;
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
    applyProductBulkAction(payload: BulkActionRequestDto): Promise<{
        updated: number;
    }>;
    listPublicCollections(query: PaginationQueryDto): Promise<{
        handle: any;
        title: any;
        description: any;
        seo: {
            title: any;
            description: any;
        };
        path: string;
        updatedAt: any;
        productCount: any;
    }[] | import("../../common/utils/pagination").PaginatedResponse<{
        handle: any;
        title: any;
        description: any;
        seo: {
            title: any;
            description: any;
        };
        path: string;
        updatedAt: any;
        productCount: any;
    }>>;
    listAdminCollections(query: PaginationQueryDto): Promise<import("../../common/utils/pagination").PaginatedResponse<{
        id: any;
        title: any;
        handle: any;
        description: any;
        image: any;
        status: string;
        productCount: any;
        updatedAt: any;
    }>>;
    getPublicCollection(idOrHandle: string): Promise<{
        handle: any;
        title: any;
        description: any;
        seo: {
            title: any;
            description: any;
        };
        path: string;
        updatedAt: any;
        productCount: any;
    }>;
    getAdminCollection(idOrHandle: string): Promise<{
        id: any;
        title: any;
        handle: any;
        description: any;
        image: any;
        status: string;
        productCount: any;
        updatedAt: any;
    }>;
    getCollectionProducts(handle: string, query: ProductQueryDto): Promise<any[] | import("../../common/utils/pagination").PaginatedResponse<any>>;
    createCollection(payload: CreateCollectionDto): Promise<{
        id: any;
        title: any;
        handle: any;
        description: any;
        image: any;
        status: string;
        productCount: any;
        updatedAt: any;
    }>;
    updateCollection(id: string, payload: Partial<CreateCollectionDto>): Promise<{
        id: any;
        title: any;
        handle: any;
        description: any;
        image: any;
        status: string;
        productCount: any;
        updatedAt: any;
    }>;
    deleteCollection(id: string): Promise<{
        id: string;
    }>;
    applyCollectionBulkAction(payload: BulkActionRequestDto): Promise<{
        updated: number;
    }>;
    listBrands(): Promise<{
        id: any;
        handle: any;
        name: any;
        description: any;
        logo: any;
        updatedAt: any;
    }[]>;
    createBrand(payload: CreateBrandDto): Promise<{
        id: any;
        handle: any;
        name: any;
        description: any;
        logo: any;
        updatedAt: any;
    }>;
    private productInclude;
    private categoryInclude;
    private serializePublicProduct;
    private serializeAdminProduct;
    private serializePublicCollection;
    private serializeAdminCollection;
    private serializeBrand;
    private normalizeProductPayload;
    private normalizeImages;
    private normalizePrimaryImageIndex;
    private buildProductSku;
    private buildDefaultVariantSku;
    private pickPrimaryPrice;
    private sortPublicProducts;
    private sortAdminProducts;
    private shouldPaginate;
    private findProduct;
    private findCollection;
    private assertUniqueProductHandle;
    private assertUniqueCollectionHandle;
    private assertUniqueBrandHandle;
    private assertCategoryIdsExist;
    private assertBrandExists;
    private toPrismaProductStatus;
    private fromPrismaProductStatus;
    private toPrismaCollectionStatus;
    private fromPrismaCollectionStatus;
    private stripHtml;
    private handlePrismaError;
}
