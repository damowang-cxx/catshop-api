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
import { PERMISSIONS } from '../../common/auth/permissions.constants';
import { RequiresPermissions } from '../../common/auth/permissions.decorator';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('admin-products')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @RequiresPermissions(PERMISSIONS.catalogRead)
  listProducts(@Query() query: ProductQueryDto) {
    return this.catalogService.listAdminProducts(query);
  }

  @Post()
  @RequiresPermissions(PERMISSIONS.catalogWrite)
  createProduct(@Body() payload: CreateProductDto) {
    return this.catalogService.createProduct(payload);
  }

  @Post('bulk')
  @RequiresPermissions(PERMISSIONS.catalogWrite)
  bulkProducts(@Body() payload: BulkActionRequestDto) {
    return this.catalogService.applyProductBulkAction(payload);
  }

  @Get(':idOrHandle')
  @RequiresPermissions(PERMISSIONS.catalogRead)
  getProduct(@Param('idOrHandle') idOrHandle: string) {
    return this.catalogService.getAdminProduct(idOrHandle);
  }

  @Put(':id')
  @RequiresPermissions(PERMISSIONS.catalogWrite)
  updateProduct(
    @Param('id') id: string,
    @Body() payload: Partial<CreateProductDto>,
  ) {
    return this.catalogService.updateProduct(id, payload);
  }

  @Delete(':id')
  @RequiresPermissions(PERMISSIONS.catalogWrite)
  deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(id);
  }
}
