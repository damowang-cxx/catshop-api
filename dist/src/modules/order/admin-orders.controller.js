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
exports.AdminOrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_auth_guard_1 = require("../../common/auth/admin-auth.guard");
const permissions_constants_1 = require("../../common/auth/permissions.constants");
const permissions_decorator_1 = require("../../common/auth/permissions.decorator");
const permissions_guard_1 = require("../../common/auth/permissions.guard");
const bulk_action_request_dto_1 = require("../../common/dto/bulk-action-request.dto");
const create_return_dto_1 = require("./dto/create-return.dto");
const create_shipment_dto_1 = require("./dto/create-shipment.dto");
const order_query_dto_1 = require("./dto/order-query.dto");
const update_order_status_dto_1 = require("./dto/update-order-status.dto");
const order_service_1 = require("./order.service");
let AdminOrdersController = class AdminOrdersController {
    orderService;
    constructor(orderService) {
        this.orderService = orderService;
    }
    listOrders(query) {
        return this.orderService.listAdminOrders(query);
    }
    bulkUpdateOrders(payload) {
        return this.orderService.applyBulkAction(payload);
    }
    getOrder(id) {
        return this.orderService.getOrder(id);
    }
    updateOrderStatus(id, payload) {
        return this.orderService.updateOrderStatus(id, payload);
    }
    createShipment(id, payload) {
        return this.orderService.createShipment(id, payload);
    }
    createReturn(id, payload) {
        return this.orderService.createReturn(id, payload);
    }
};
exports.AdminOrdersController = AdminOrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.ordersRead),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_query_dto_1.OrderQueryDto]),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "listOrders", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.ordersWrite),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_action_request_dto_1.BulkActionRequestDto]),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "bulkUpdateOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.ordersRead),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.ordersWrite),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_status_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Post)(':id/shipments'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.ordersWrite),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_shipment_dto_1.CreateShipmentDto]),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "createShipment", null);
__decorate([
    (0, common_1.Post)(':id/returns'),
    (0, permissions_decorator_1.RequiresPermissions)(permissions_constants_1.PERMISSIONS.ordersWrite),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_return_dto_1.CreateReturnDto]),
    __metadata("design:returntype", void 0)
], AdminOrdersController.prototype, "createReturn", null);
exports.AdminOrdersController = AdminOrdersController = __decorate([
    (0, swagger_1.ApiTags)('admin-orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('admin/orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], AdminOrdersController);
//# sourceMappingURL=admin-orders.controller.js.map