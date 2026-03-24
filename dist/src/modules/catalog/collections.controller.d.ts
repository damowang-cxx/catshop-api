import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CatalogService } from './catalog.service';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class CollectionsController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listCollections(query: PaginationQueryDto): Promise<{
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
    getCollectionProducts(handle: string, query: ProductQueryDto): Promise<any[] | import("../../common/utils/pagination").PaginatedResponse<any>>;
    getCollection(idOrHandle: string): Promise<{
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
}
