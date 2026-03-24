import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { AdminOrdersController } from './admin-orders.controller';
import { OrderService } from './order.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [CartModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrderService],
})
export class OrderModule {}
