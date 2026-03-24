import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { AuthService } from '../auth/auth.service';
import { CartService } from './cart.service';
import { AddCartLinesDto } from './dto/add-cart-lines.dto';
import { RemoveCartLinesDto } from './dto/remove-cart-lines.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly authService: AuthService,
  ) {}

  private async resolveCustomerId(request: FastifyRequest) {
    const customer = await this.authService.tryGetCurrentCustomer(request);
    return customer?.id;
  }

  @Get(':id')
  async getCart(@Param('id') id: string, @Req() request: FastifyRequest) {
    return this.cartService.getCart(id, await this.resolveCustomerId(request));
  }

  @Post()
  async createCart(@Req() request: FastifyRequest) {
    return this.cartService.createCart(await this.resolveCustomerId(request));
  }

  @Post(':id/items')
  async addCartItems(
    @Param('id') id: string,
    @Body() payload: AddCartLinesDto,
    @Req() request: FastifyRequest,
  ) {
    return this.cartService.addLines(
      id,
      payload,
      await this.resolveCustomerId(request),
    );
  }

  @Patch(':id/items')
  async updateCartItems(
    @Param('id') id: string,
    @Body() payload: AddCartLinesDto,
    @Req() request: FastifyRequest,
  ) {
    return this.cartService.updateLines(
      id,
      payload,
      await this.resolveCustomerId(request),
    );
  }

  @Delete(':id/items')
  async removeCartItems(
    @Param('id') id: string,
    @Body() payload: RemoveCartLinesDto,
    @Req() request: FastifyRequest,
  ) {
    return this.cartService.removeLines(
      id,
      payload,
      await this.resolveCustomerId(request),
    );
  }
}
