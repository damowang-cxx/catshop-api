"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const common_module_1 = require("./common/common.module");
const app_config_1 = require("./config/app.config");
const env_validation_1 = require("./config/env.validation");
const auth_module_1 = require("./modules/auth/auth.module");
const catalog_module_1 = require("./modules/catalog/catalog.module");
const cart_module_1 = require("./modules/cart/cart.module");
const health_module_1 = require("./modules/health/health.module");
const order_module_1 = require("./modules/order/order.module");
const content_module_1 = require("./modules/content/content.module");
const media_module_1 = require("./modules/media/media.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const customer_module_1 = require("./modules/customer/customer.module");
const search_module_1 = require("./modules/search/search.module");
const prisma_module_1 = require("./prisma/prisma.module");
const mock_database_module_1 = require("./shared/mock-database.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.appConfig, app_config_1.databaseConfig, app_config_1.storageConfig, app_config_1.uploadConfig],
                validate: env_validation_1.validateEnv,
            }),
            common_module_1.CommonModule,
            prisma_module_1.PrismaModule,
            mock_database_module_1.MockDatabaseModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            catalog_module_1.CatalogModule,
            cart_module_1.CartModule,
            order_module_1.OrderModule,
            content_module_1.ContentModule,
            media_module_1.MediaModule,
            analytics_module_1.AnalyticsModule,
            inventory_module_1.InventoryModule,
            customer_module_1.CustomerModule,
            search_module_1.SearchModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map