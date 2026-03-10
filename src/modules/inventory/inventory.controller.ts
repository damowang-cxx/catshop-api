import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { InventoryAdjustmentDto } from './dto/inventory-adjustment.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post('adjustments')
  adjustInventory(@Body() payload: InventoryAdjustmentDto) {
    return this.inventoryService.adjustInventory(payload);
  }
}
