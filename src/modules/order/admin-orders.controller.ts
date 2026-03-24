import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { PERMISSIONS } from '../../common/auth/permissions.constants';
import { RequiresPermissions } from '../../common/auth/permissions.decorator';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { CreateReturnDto } from './dto/create-return.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderService } from './order.service';

@ApiTags('admin-orders')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @RequiresPermissions(PERMISSIONS.ordersRead)
  listOrders(@Query() query: OrderQueryDto) {
    return this.orderService.listAdminOrders(query);
  }

  @Post('bulk')
  @RequiresPermissions(PERMISSIONS.ordersWrite)
  bulkUpdateOrders(@Body() payload: BulkActionRequestDto) {
    return this.orderService.applyBulkAction(payload);
  }

  @Get(':id')
  @RequiresPermissions(PERMISSIONS.ordersRead)
  getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  @Patch(':id')
  @RequiresPermissions(PERMISSIONS.ordersWrite)
  updateOrderStatus(
    @Param('id') id: string,
    @Body() payload: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, payload);
  }

  @Post(':id/shipments')
  @RequiresPermissions(PERMISSIONS.ordersWrite)
  createShipment(@Param('id') id: string, @Body() payload: CreateShipmentDto) {
    return this.orderService.createShipment(id, payload);
  }

  @Post(':id/returns')
  @RequiresPermissions(PERMISSIONS.ordersWrite)
  createReturn(@Param('id') id: string, @Body() payload: CreateReturnDto) {
    return this.orderService.createReturn(id, payload);
  }
}
