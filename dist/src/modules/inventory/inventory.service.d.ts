import { PrismaService } from '../../prisma/prisma.service';
import { InventoryAdjustmentDto } from './dto/inventory-adjustment.dto';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    adjustInventory(payload: InventoryAdjustmentDto): Promise<{
        productId: string;
        inventory: number;
        reason: string;
    }>;
}
