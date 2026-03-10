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
const pagination_query_dto_1 = require("../../common/dto/pagination-query.dto");
const pagination_1 = require("../../common/utils/pagination");
const mock_database_service_1 = require("../../shared/mock-database.service");
let CustomerController = class CustomerController {
    mockDb;
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    listCustomers(query) {
        let customers = [...this.mockDb.customers];
        if (query.q) {
            const keyword = query.q.toLowerCase();
            customers = customers.filter((customer) => customer.email.toLowerCase().includes(keyword));
        }
        return (0, pagination_1.paginate)(customers.map((customer) => ({
            id: customer.id,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            status: customer.status,
            lastLoginAt: customer.lastLoginAt,
        })), query);
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], CustomerController.prototype, "listCustomers", null);
exports.CustomerController = CustomerController = __decorate([
    (0, swagger_1.ApiTags)('customers'),
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [mock_database_service_1.MockDatabaseService])
], CustomerController);
//# sourceMappingURL=customer.controller.js.map