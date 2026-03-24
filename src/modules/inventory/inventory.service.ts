import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryChangeType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryAdjustmentDto } from './dto/inventory-adjustment.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async adjustInventory(payload: InventoryAdjustmentDto) {
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
      throw new NotFoundException('Product not found.');
    }

    const variant = product.variants[0];
    const inventoryItem = variant?.inventoryItem;
    if (!variant || !inventoryItem) {
      throw new NotFoundException('Inventory item not found.');
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
          changeType: InventoryChangeType.ADJUSTMENT,
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
}
