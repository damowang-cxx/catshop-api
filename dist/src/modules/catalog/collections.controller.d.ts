import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CatalogService } from './catalog.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class CollectionsController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listCollections(query: PaginationQueryDto): import("../../common/types/domain.types").CollectionRecord[] | import("../../common/utils/pagination").PaginatedResponse<import("../../common/types/domain.types").CollectionRecord>;
    createCollection(payload: CreateCollectionDto): import("../../common/types/domain.types").CollectionRecord;
    bulkCollections(payload: BulkActionRequestDto): {
        updated: number;
    };
    getCollectionProducts(handle: string, query: ProductQueryDto): import("../../common/types/domain.types").ProductRecord[];
    getCollection(idOrHandle: string): import("../../common/types/domain.types").CollectionRecord;
    updateCollection(id: string, payload: Partial<CreateCollectionDto>): import("../../common/types/domain.types").CollectionRecord;
    deleteCollection(id: string): import("../../common/types/domain.types").CollectionRecord;
}
