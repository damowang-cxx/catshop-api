import { Injectable, NotFoundException } from '@nestjs/common';
import { MockDatabaseService } from '../../shared/mock-database.service';
import { InventoryAdjustmentDto } from './dto/inventory-adjustment.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly mockDb: MockDatabaseService) {}

  adjustInventory(payload: InventoryAdjustmentDto) {
    const product = this.mockDb.products.find(
      (candidate) => candidate.id === payload.productId,
    );
    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    product.inventory += payload.delta;
    product.updatedAt = new Date().toISOString();

    return {
      productId: product.id,
      inventory: product.inventory,
      reason: payload.reason,
    };
  }
}
