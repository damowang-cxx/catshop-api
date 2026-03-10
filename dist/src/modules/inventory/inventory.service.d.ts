import { MockDatabaseService } from '../../shared/mock-database.service';
import { InventoryAdjustmentDto } from './dto/inventory-adjustment.dto';
export declare class InventoryService {
    private readonly mockDb;
    constructor(mockDb: MockDatabaseService);
    adjustInventory(payload: InventoryAdjustmentDto): {
        productId: string;
        inventory: number;
        reason: string;
    };
}
