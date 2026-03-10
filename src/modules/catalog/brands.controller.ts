import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { CatalogService } from './catalog.service';
import { CreateBrandDto } from './dto/create-brand.dto';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  listBrands() {
    return this.catalogService.listBrands();
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post()
  createBrand(@Body() payload: CreateBrandDto) {
    return this.catalogService.createBrand(payload);
  }
}
