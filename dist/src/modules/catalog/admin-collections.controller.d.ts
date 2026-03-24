import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CatalogService } from './catalog.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
export declare class AdminCollectionsController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listCollections(query: PaginationQueryDto): Promise<import("../../common/utils/pagination").PaginatedResponse<{
        id: any;
        title: any;
        handle: any;
        description: any;
        image: any;
        status: string;
        productCount: any;
        updatedAt: any;
    }>>;
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
    bulkCollections(payload: BulkActionRequestDto): Promise<{
        updated: number;
    }>;
    getCollection(idOrHandle: string): Promise<{
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
}
