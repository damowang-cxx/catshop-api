import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class ProductsController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listProducts(query: ProductQueryDto): import("../../common/types/domain.types").ProductRecord[] | import("../../common/utils/pagination").PaginatedResponse<import("../../common/types/domain.types").ProductRecord>;
    createProduct(payload: CreateProductDto): import("../../common/types/domain.types").ProductRecord;
    bulkProducts(payload: BulkActionRequestDto): {
        updated: number;
    };
    getRecommendations(idOrHandle: string): import("../../common/types/domain.types").ProductRecord[];
    getProduct(idOrHandle: string): import("../../common/types/domain.types").ProductRecord;
    updateProduct(id: string, payload: Partial<CreateProductDto>): import("../../common/types/domain.types").ProductRecord;
    deleteProduct(id: string): import("../../common/types/domain.types").ProductRecord;
}
