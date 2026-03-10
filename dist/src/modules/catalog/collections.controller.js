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
exports.CollectionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_auth_guard_1 = require("../../common/auth/admin-auth.guard");
const bulk_action_request_dto_1 = require("../../common/dto/bulk-action-request.dto");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const catalog_service_1 = require("./catalog.service");
const create_collection_dto_1 = require("./dto/create-collection.dto");
const product_query_dto_1 = require("./dto/product-query.dto");
let CollectionsController = class CollectionsController {
    catalogService;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    listCollections(query) {
        const adminView = typeof query.page === 'number' || typeof query.pageSize === 'number';
        return this.catalogService.listCollections(query, adminView);
    }
    createCollection(payload) {
        return this.catalogService.createCollection(payload);
    }
    bulkCollections(payload) {
        return this.catalogService.applyCollectionBulkAction(payload);
    }
    getCollectionProducts(handle, query) {
        return this.catalogService.getCollectionProducts(handle, query);
    }
    getCollection(idOrHandle) {
        return this.catalogService.getCollection(idOrHandle);
    }
    updateCollection(id, payload) {
        return this.catalogService.updateCollection(id, payload);
    }
    deleteCollection(id) {
        return this.catalogService.deleteCollection(id);
    }
};
exports.CollectionsController = CollectionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "listCollections", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_collection_dto_1.CreateCollectionDto]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "createCollection", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_action_request_dto_1.BulkActionRequestDto]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "bulkCollections", null);
__decorate([
    (0, common_1.Get)(':handle/products'),
    __param(0, (0, common_1.Param)('handle')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_query_dto_1.ProductQueryDto]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "getCollectionProducts", null);
__decorate([
    (0, common_1.Get)(':idOrHandle'),
    __param(0, (0, common_1.Param)('idOrHandle')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "getCollection", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "updateCollection", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "deleteCollection", null);
exports.CollectionsController = CollectionsController = __decorate([
    (0, swagger_1.ApiTags)('collections'),
    (0, common_1.Controller)('collections'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CollectionsController);
//# sourceMappingURL=collections.controller.js.map