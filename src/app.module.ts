import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import {
  appConfig,
  databaseConfig,
  storageConfig,
  uploadConfig,
} from './config/app.config';
import { validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CartModule } from './modules/cart/cart.module';
import { HealthModule } from './modules/health/health.module';
import { OrderModule } from './modules/order/order.module';
import { ContentModule } from './modules/content/content.module';
import { MediaModule } from './modules/media/media.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomerModule } from './modules/customer/customer.module';
import { SearchModule } from './modules/search/search.module';
import { PrismaModule } from './prisma/prisma.module';
import { MockDatabaseModule } from './shared/mock-database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, storageConfig, uploadConfig],
      validate: validateEnv,
    }),
    CommonModule,
    PrismaModule,
    MockDatabaseModule,
    HealthModule,
    AuthModule,
    CatalogModule,
    CartModule,
    OrderModule,
    ContentModule,
    MediaModule,
    AnalyticsModule,
    InventoryModule,
    CustomerModule,
    SearchModule,
  ],
})
export class AppModule {}
