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
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let InventoryService = class InventoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async adjustInventory(payload) {
        const product = await this.prisma.product.findUnique({
            where: { id: payload.productId },
            include: {
                variants: {
                    include: {
                        inventoryItem: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found.');
        }
        const variant = product.variants[0];
        const inventoryItem = variant?.inventoryItem;
        if (!variant || !inventoryItem) {
            throw new common_1.NotFoundException('Inventory item not found.');
        }
        const nextQuantity = inventoryItem.quantityOnHand + payload.delta;
        await this.prisma.$transaction([
            this.prisma.inventoryItem.update({
                where: { id: inventoryItem.id },
                data: {
                    quantityOnHand: nextQuantity,
                },
            }),
            this.prisma.inventoryLedger.create({
                data: {
                    inventoryItemId: inventoryItem.id,
                    changeType: client_1.InventoryChangeType.ADJUSTMENT,
                    quantity: payload.delta,
                    reason: payload.reason,
                    referenceType: 'admin_adjustment',
                    referenceId: payload.productId,
                },
            }),
        ]);
        return {
            productId: product.id,
            inventory: nextQuantity,
            reason: payload.reason,
        };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map