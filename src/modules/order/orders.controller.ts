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
import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateReturnDto } from './dto/create-return.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderService } from './order.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  listOrders(@Query() query: OrderQueryDto) {
    const adminView = typeof query.page === 'number' || typeof query.pageSize === 'number';
    return this.orderService.listOrders(query, adminView);
  }

  @Post()
  createOrder(@Body() payload: CreateOrderDto) {
    return this.orderService.createOrder(payload);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post('bulk')
  bulkUpdateOrders(@Body() payload: BulkActionRequestDto) {
    return this.orderService.applyBulkAction(payload);
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() payload: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, payload);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post(':id/shipments')
  createShipment(@Param('id') id: string, @Body() payload: CreateShipmentDto) {
    return this.orderService.createShipment(id, payload);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post(':id/returns')
  createReturn(@Param('id') id: string, @Body() payload: CreateReturnDto) {
    return this.orderService.createReturn(id, payload);
  }
}
