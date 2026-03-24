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
exports.AdminCollectionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_auth_guard_1 = require("../../common/auth/admin-auth.guard");
const permissions_constants_1 = require("../../common/auth/permissions.constants");
const permissions_decorator_1 = require("../../common/auth/permissions.decorator");
const permissions_guard_1 = require("../../common/auth/permissions.guard");
const bulk_action_request_dto_1 = require("../../common/dto/bulk-action-request.dto");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const catalog_service_1 = require("./catalog.service");
const create_collection_dto_1 = require("./dto/create-collection.dto");
let AdminCollectionsController = class AdminCollectionsController {
    catalogService;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    listCollections(query) {
        return this.catalogService.listAdminCollections(query);
    }
    createCollection(payload) {
        return this.catalogService.createCollection(payload);
    }
    bulkCollections(payload) {
        return this.catalogService.applyCollectionBulkAction(payload);
    }
    getCollection(idOrHandle) {
        return this.catalogService.getAdminCollection(idOrHandle);
    }
    updateCollection(id, payload) {
        return this.catalogService.updateCollection(id, payload);
    }
    deleteCollection(id) {
        return this.catalogService.deleteCollection(id);
    }
};
exports.AdminCollectionsController = AdminCollectionsController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogRead),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], AdminCollectionsController.prototype, "listCollections", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogWrite),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_collection_dto_1.CreateCollectionDto]),
    __metadata("design:returntype", void 0)
], AdminCollectionsController.prototype, "createCollection", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogWrite),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_action_request_dto_1.BulkActionRequestDto]),
    __metadata("design:returntype", void 0)
], AdminCollectionsController.prototype, "bulkCollections", null);
__decorate([
    (0, common_1.Get)(':idOrHandle'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogRead),
    __param(0, (0, common_1.Param)('idOrHandle')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminCollectionsController.prototype, "getCollection", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogWrite),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminCollectionsController.prototype, "updateCollection", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.catalogWrite),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminCollectionsController.prototype, "deleteCollection", null);
exports.AdminCollectionsController = AdminCollectionsController = __decorate([
    (0, swagger_1.ApiTags)('admin-collections'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('admin/collections'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], AdminCollectionsController);
//# sourceMappingURL=admin-collections.controller.js.map