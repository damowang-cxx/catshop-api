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
exports.AdminBrandsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_auth_guard_1 = require("../../common/auth/admin-auth.guard");
const permissions_constants_1 = require("../../common/auth/permissions.constants");
const permissions_decorator_1 = require("../../common/auth/permissions.decorator");
const permissions_guard_1 = require("../../common/auth/permissions.guard");
const catalog_service_1 = require("./catalog.service");
const create_brand_dto_1 = require("./dto/create-brand.dto");
let AdminBrandsController = class AdminBrandsController {
    catalogService;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    listBrands() {
        return this.catalogService.listBrands();
    }
    createBrand(payload) {
        return this.catalogService.createBrand(payload);
    }
};
exports.AdminBrandsController = AdminBrandsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogRead),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminBrandsController.prototype, "listBrands", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogWrite),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_brand_dto_1.CreateBrandDto]),
    __metadata("design:returntype", void 0)
], AdminBrandsController.prototype, "createBrand", null);
exports.AdminBrandsController = AdminBrandsController = __decorate([
    (0, swagger_1.ApiTags)('admin-brands'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('admin/brands'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], AdminBrandsController);
//# sourceMappingURL=admin-brands.controller.js.map