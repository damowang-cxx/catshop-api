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
exports.CustomerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_auth_guard_1 = require("../../common/auth/admin-auth.guard");
const permissions_constants_1 = require("../../common/auth/permissions.constants");
const permissions_decorator_1 = require("../../common/auth/permissions.decorator");
const permissions_guard_1 = require("../../common/auth/permissions.guard");
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const prisma_service_1 = require("../../prisma/prisma.service");
let CustomerController = class CustomerController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listCustomers(query) {
        const page = Math.max(1, query.page ?? 1);
        const pageSize = Math.max(1, query.pageSize ?? 20);
        const where = query.q
            ? {
                email: {
                    contains: query.q,
                    mode: 'insensitive',
                },
            }
            : {};
        const [items, total] = await this.prisma.$transaction([
            this.prisma.customer.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    status: true,
                    lastLoginAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.customer.count({ where }),
        ]);
        return {
            items: items.map((customer) => ({
                ...customer,
                status: customer.status.toLowerCase(),
                lastLoginAt: customer.lastLoginAt?.toISOString() ?? undefined,
            })),
            total,
            page,
            pageSize,
        };
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.customersRead),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "listCustomers", null);
exports.CustomerController = CustomerController = __decorate([
    (0, swagger_1.ApiTags)('customers'),
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerController);
//# sourceMappingURL=customer.controller.js.map