import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CatalogService } from './catalog.service';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  listCollections(@Query() query: PaginationQueryDto) {
    return this.catalogService.listPublicCollections(query);
  }

  @Get(':handle/products')
  getCollectionProducts(
    @Param('handle') handle: string,
    @Query() query: ProductQueryDto,
  ) {
    return this.catalogService.getCollectionProducts(handle, query);
  }

  @Get(':idOrHandle')
  getCollection(@Param('idOrHandle') idOrHandle: string) {
    return this.catalogService.getPublicCollection(idOrHandle);
  }
}
