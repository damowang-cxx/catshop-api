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
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  listProducts(@Query() query: ProductQueryDto) {
    const adminView = typeof query.page === 'number' || typeof query.pageSize === 'number';
    return this.catalogService.listProducts(query, adminView);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post()
  createProduct(@Body() payload: CreateProductDto) {
    return this.catalogService.createProduct(payload);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post('bulk')
  bulkProducts(@Body() payload: BulkActionRequestDto) {
    return this.catalogService.applyProductBulkAction(payload);
  }

  @Get(':idOrHandle/recommendations')
  getRecommendations(@Param('idOrHandle') idOrHandle: string) {
    return this.catalogService.getProductRecommendations(idOrHandle);
  }

  @Get(':idOrHandle')
  getProduct(@Param('idOrHandle') idOrHandle: string) {
    return this.catalogService.getProduct(idOrHandle);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Put(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() payload: Partial<CreateProductDto>,
  ) {
    return this.catalogService.updateProduct(id, payload);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(id);
  }
}
