import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  listProducts(@Query() query: ProductQueryDto) {
    return this.catalogService.listPublicProducts(query);
  }

  @Get(':idOrHandle/recommendations')
  getRecommendations(@Param('idOrHandle') idOrHandle: string) {
    return this.catalogService.getProductRecommendations(idOrHandle);
  }

  @Get(':idOrHandle')
  getProduct(@Param('idOrHandle') idOrHandle: string) {
    return this.catalogService.getPublicProduct(idOrHandle);
  }
}
