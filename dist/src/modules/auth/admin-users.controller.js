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
exports.AdminUsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_auth_guard_1 = require("../../common/auth/admin-auth.guard");
const permissions_decorator_1 = require("../../common/auth/permissions.decorator");
const permissions_guard_1 = require("../../common/auth/permissions.guard");
const permissions_constants_1 = require("../../common/auth/permissions.constants");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const auth_service_1 = require("./auth.service");
const create_admin_user_dto_1 = require("./dto/create-admin-user.dto");
const update_admin_user_dto_1 = require("./dto/update-admin-user.dto");
let AdminUsersController = class AdminUsersController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    listRoles() {
        return this.authService.listRoles();
    }
    listAdminUsers(query) {
        return this.authService.listAdminUsers(query);
    }
    createAdminUser(payload) {
        return this.authService.createAdminUser(payload);
    }
    updateAdminUser(id, payload) {
        return this.authService.updateAdminUser(id, payload);
    }
};
exports.AdminUsersController = AdminUsersController;
__decorate([
    (0, common_1.Get)('roles'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.adminsRead),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminUsersController.prototype, "listRoles", null);
__decorate([
    (0, common_1.Get)('admin-users'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.adminsRead),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], AdminUsersController.prototype, "listAdminUsers", null);
__decorate([
    (0, common_1.Post)('admin-users'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.adminsWrite),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_user_dto_1.CreateAdminUserDto]),
    __metadata("design:returntype", void 0)
], AdminUsersController.prototype, "createAdminUser", null);
__decorate([
    (0, common_1.Patch)('admin-users/:id'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.adminsWrite),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_admin_user_dto_1.UpdateAdminUserDto]),
    __metadata("design:returntype", void 0)
], AdminUsersController.prototype, "updateAdminUser", null);
exports.AdminUsersController = AdminUsersController = __decorate([
    (0, swagger_1.ApiTags)('admin-users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AdminUsersController);
//# sourceMappingURL=admin-users.controller.js.map