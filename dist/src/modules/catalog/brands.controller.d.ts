import { CatalogService } from './catalog.service';
export declare class BrandsController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listBrands(): Promise<{
        id: any;
        handle: any;
        name: any;
        description: any;
        logo: any;
        updatedAt: any;
    }[]>;
}
