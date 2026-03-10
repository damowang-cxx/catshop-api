import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartLinesDto } from './dto/add-cart-lines.dto';
import { RemoveCartLinesDto } from './dto/remove-cart-lines.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':id')
  getCart(@Param('id') id: string) {
    return this.cartService.getCart(id);
  }

  @Post()
  createCart() {
    return this.cartService.createCart();
  }

  @Post(':id/items')
  addCartItems(@Param('id') id: string, @Body() payload: AddCartLinesDto) {
    return this.cartService.addLines(id, payload);
  }

  @Patch(':id/items')
  updateCartItems(@Param('id') id: string, @Body() payload: AddCartLinesDto) {
    return this.cartService.updateLines(id, payload);
  }

  @Delete(':id/items')
  removeCartItems(
    @Param('id') id: string,
    @Body() payload: RemoveCartLinesDto,
  ) {
    return this.cartService.removeLines(id, payload);
  }
}
