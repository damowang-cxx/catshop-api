import { InventoryAdjustmentDto } from './dto/inventory-adjustment.dto';
import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    adjustInventory(payload: InventoryAdjustmentDto): Promise<{
        productId: string;
        inventory: number;
        reason: string;
    }>;
}
