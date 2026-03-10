import { CatalogService } from './catalog.service';
import { CreateBrandDto } from './dto/create-brand.dto';
export declare class BrandsController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    listBrands(): import("../../common/types/domain.types").BrandRecord[];
    createBrand(payload: CreateBrandDto): {
        id: string;
        name: string;
        handle: string;
        description: string | undefined;
        logo: string | undefined;
    };
}
