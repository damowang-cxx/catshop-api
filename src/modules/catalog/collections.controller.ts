import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CatalogService } from './catalog.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  listCollections(@Query() query: PaginationQueryDto) {
    const adminView = typeof query.page === 'number' || typeof query.pageSize === 'number';
    return this.catalogService.listCollections(query, adminView);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post()
  createCollection(@Body() payload: CreateCollectionDto) {
    return this.catalogService.createCollection(payload);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post('bulk')
  bulkCollections(@Body() payload: BulkActionRequestDto) {
    return this.catalogService.applyCollectionBulkAction(payload);
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
    return this.catalogService.getCollection(idOrHandle);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Put(':id')
  updateCollection(
    @Param('id') id: string,
    @Body() payload: Partial<CreateCollectionDto>,
  ) {
    return this.catalogService.updateCollection(id, payload);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  deleteCollection(@Param('id') id: string) {
    return this.catalogService.deleteCollection(id);
  }
}
