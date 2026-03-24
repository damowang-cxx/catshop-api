"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const admin_auth_guard_1 = require("./auth/admin-auth.guard");
const customer_auth_guard_1 = require("./auth/customer-auth.guard");
const permissions_guard_1 = require("./auth/permissions.guard");
const prisma_module_1 = require("../prisma/prisma.module");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({}), prisma_module_1.PrismaModule],
        providers: [admin_auth_guard_1.AdminAuthGuard, customer_auth_guard_1.CustomerAuthGuard, permissions_guard_1.PermissionsGuard],
        exports: [admin_auth_guard_1.AdminAuthGuard, customer_auth_guard_1.CustomerAuthGuard, permissions_guard_1.PermissionsGuard, jwt_1.JwtModule],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map