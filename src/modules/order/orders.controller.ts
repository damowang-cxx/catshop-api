import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { CustomerAuthGuard } from '../../common/auth/customer-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderService } from './order.service';

@ApiTags('orders')
@UseGuards(CustomerAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  listOrders(
    @Req() request: FastifyRequest & { customer: { id: string } },
    @Query() query: OrderQueryDto,
  ) {
    return this.orderService.listCustomerOrders(request.customer.id, query);
  }

  @Post()
  createOrder(
    @Req() request: FastifyRequest & { customer: { id: string } },
    @Body() payload: CreateOrderDto,
  ) {
    return this.orderService.createOrder(request.customer.id, payload);
  }

  @Get(':id')
  getOrder(
    @Req() request: FastifyRequest & { customer: { id: string } },
    @Param('id') id: string,
  ) {
    return this.orderService.getOrder(id, request.customer.id);
  }
}
