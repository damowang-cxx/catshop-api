import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  listBrands() {
    return this.catalogService.listBrands();
  }
}
