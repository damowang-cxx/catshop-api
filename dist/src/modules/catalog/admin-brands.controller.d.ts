import { CatalogService } from './catalog.service';
import { CreateBrandDto } from './dto/create-brand.dto';
export declare class AdminBrandsController {
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
    createBrand(payload: CreateBrandDto): Promise<{
        id: any;
        handle: any;
        name: any;
        description: any;
        logo: any;
        updatedAt: any;
    }>;
}
