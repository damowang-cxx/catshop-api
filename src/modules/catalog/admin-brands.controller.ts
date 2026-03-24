import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { PERMISSIONS } from '../../common/auth/permissions.constants';
import { RequiresPermissions } from '../../common/auth/permissions.decorator';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { CatalogService } from './catalog.service';
import { CreateBrandDto } from './dto/create-brand.dto';

@ApiTags('admin-brands')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('admin/brands')
export class AdminBrandsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @RequiresPermissions(PERMISSIONS.catalogRead)
  listBrands() {
    return this.catalogService.listBrands();
  }

  @Post()
  @RequiresPermissions(PERMISSIONS.catalogWrite)
  createBrand(@Body() payload: CreateBrandDto) {
    return this.catalogService.createBrand(payload);
  }
}
