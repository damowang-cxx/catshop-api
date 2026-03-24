import { CatalogService } from './catalog.service';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class ProductsController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listProducts(query: ProductQueryDto): Promise<any[] | import("../../common/utils/pagination").PaginatedResponse<any>>;
    getRecommendations(idOrHandle: string): Promise<{
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
    getProduct(idOrHandle: string): Promise<{
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
}
