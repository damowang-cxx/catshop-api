import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CollectionRecord, ProductRecord } from '../../common/types/domain.types';
import { MockDatabaseService } from '../../shared/mock-database.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class CatalogService {
    private readonly mockDb;
    constructor(mockDb: MockDatabaseService);
    listProducts(query: ProductQueryDto, adminView?: boolean): ProductRecord[] | import("../../common/utils/pagination").PaginatedResponse<ProductRecord>;
    getProduct(idOrHandle: string): ProductRecord;
    getProductRecommendations(idOrHandle: string): ProductRecord[];
    createProduct(payload: CreateProductDto): ProductRecord;
    updateProduct(id: string, payload: Partial<CreateProductDto>): ProductRecord;
    deleteProduct(id: string): ProductRecord;
    applyProductBulkAction(payload: BulkActionRequestDto): {
        updated: number;
    };
    listCollections(query: PaginationQueryDto, adminView?: boolean): CollectionRecord[] | import("../../common/utils/pagination").PaginatedResponse<CollectionRecord>;
    getCollection(idOrHandle: string): CollectionRecord;
    getCollectionProducts(handle: string, query: ProductQueryDto): ProductRecord[];
    createCollection(payload: CreateCollectionDto): CollectionRecord;
    updateCollection(id: string, payload: Partial<CreateCollectionDto>): CollectionRecord;
    deleteCollection(id: string): CollectionRecord;
    applyCollectionBulkAction(payload: BulkActionRequestDto): {
        updated: number;
    };
    listBrands(): import("../../common/types/domain.types").BrandRecord[];
    createBrand(payload: CreateBrandDto): {
        id: string;
        name: string;
        handle: string;
        description: string | undefined;
        logo: string | undefined;
    };
    private sortProducts;
    private refreshCollectionCounts;
}
