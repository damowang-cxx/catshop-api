import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { BrandsController } from './brands.controller';
import { CollectionsController } from './collections.controller';
import { ProductsController } from './products.controller';

@Module({
  controllers: [ProductsController, CollectionsController, BrandsController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
