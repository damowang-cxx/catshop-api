import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { OrderService } from './order.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [CartModule],
  controllers: [OrdersController],
  providers: [OrderService],
})
export class OrderModule {}
