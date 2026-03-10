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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const mock_database_service_1 = require("../../shared/mock-database.service");
let InventoryService = class InventoryService {
    mockDb;
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    adjustInventory(payload) {
        const product = this.mockDb.products.find((candidate) => candidate.id === payload.productId);
        if (!product) {
            throw new common_1.NotFoundException('Product not found.');
        }
        product.inventory += payload.delta;
        product.updatedAt = new Date().toISOString();
        return {
            productId: product.id,
            inventory: product.inventory,
            reason: payload.reason,
        };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_database_service_1.MockDatabaseService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map