import { Module } from '@nestjs/common';
import { AdminBrandsController } from './admin-brands.controller';
import { AdminCollectionsController } from './admin-collections.controller';
import { AdminProductsController } from './admin-products.controller';
import { BrandsController } from './brands.controller';
import { CatalogService } from './catalog.service';
import { CollectionsController } from './collections.controller';
import { ProductsController } from './products.controller';

@Module({
  controllers: [
    ProductsController,
    AdminProductsController,
    CollectionsController,
    AdminCollectionsController,
    BrandsController,
    AdminBrandsController,
  ],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
