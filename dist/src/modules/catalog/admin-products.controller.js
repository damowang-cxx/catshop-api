"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_auth_guard_1 = require("../../common/auth/admin-auth.guard");
const permissions_constants_1 = require("../../common/auth/permissions.constants");
const permissions_decorator_1 = require("../../common/auth/permissions.decorator");
const permissions_guard_1 = require("../../common/auth/permissions.guard");
const bulk_action_request_dto_1 = require("../../common/dto/bulk-action-request.dto");
const catalog_service_1 = require("./catalog.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const product_query_dto_1 = require("./dto/product-query.dto");
let AdminProductsController = class AdminProductsController {
    catalogService;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    listProducts(query) {
        return this.catalogService.listAdminProducts(query);
    }
    createProduct(payload) {
        return this.catalogService.createProduct(payload);
    }
    bulkProducts(payload) {
        return this.catalogService.applyProductBulkAction(payload);
    }
    getProduct(idOrHandle) {
        return this.catalogService.getAdminProduct(idOrHandle);
    }
    updateProduct(id, payload) {
        return this.catalogService.updateProduct(id, payload);
    }
    deleteProduct(id) {
        return this.catalogService.deleteProduct(id);
    }
};
exports.AdminProductsController = AdminProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogRead),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_query_dto_1.ProductQueryDto]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "listProducts", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogWrite),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogWrite),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_action_request_dto_1.BulkActionRequestDto]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "bulkProducts", null);
__decorate([
    (0, common_1.Get)(':idOrHandle'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogRead),
    __param(0, (0, common_1.Param)('idOrHandle')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogWrite),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogWrite),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminProductsController.prototype, "deleteProduct", null);
exports.AdminProductsController = AdminProductsController = __decorate([
    (0, swagger_1.ApiTags)('admin-products'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('admin/products'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], AdminProductsController);
//# sourceMappingURL=admin-products.controller.js.map