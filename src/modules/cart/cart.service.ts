import { Injectable, NotFoundException } from '@nestjs/common';
import { MockDatabaseService } from '../../shared/mock-database.service';
import { AddCartLinesDto } from './dto/add-cart-lines.dto';
import { RemoveCartLinesDto } from './dto/remove-cart-lines.dto';

@Injectable()
export class CartService {
  constructor(private readonly mockDb: MockDatabaseService) {}

  createCart() {
    const now = new Date().toISOString();
    const cart = {
      id: this.mockDb.createId('cart'),
      currencyCode: 'USD',
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    this.mockDb.carts.push(cart);
    return this.serializeCart(cart.id);
  }

  getCart(id: string) {
    return this.serializeCart(id);
  }

  addLines(cartId: string, payload: AddCartLinesDto) {
    const cart = this.findCart(cartId);

    payload.lines.forEach((line) => {
      const product = this.findProductByMerchandise(line.merchandiseId);
      const existing = cart.items.find(
        (item) => item.merchandiseId === line.merchandiseId,
      );

      if (existing) {
        existing.quantity += line.quantity;
      } else {
        cart.items.push({
          id: this.mockDb.createId('line'),
          merchandiseId: line.merchandiseId,
          quantity: line.quantity,
          productId: product.id,
        });
      }
    });

    cart.updatedAt = new Date().toISOString();
    return this.serializeCart(cartId);
  }

  updateLines(cartId: string, payload: AddCartLinesDto) {
    const cart = this.findCart(cartId);

    payload.lines.forEach((line) => {
      const cartLine = cart.items.find((item) => item.id === line.id);
      if (cartLine) {
        const product = this.findProductByMerchandise(line.merchandiseId);
        cartLine.merchandiseId = line.merchandiseId;
        cartLine.productId = product.id;
        cartLine.quantity = line.quantity;
      }
    });

    cart.updatedAt = new Date().toISOString();
    return this.serializeCart(cartId);
  }

  removeLines(cartId: string, payload: RemoveCartLinesDto) {
    const cart = this.findCart(cartId);
    cart.items = cart.items.filter((item) => !payload.lineIds.includes(item.id));
    cart.updatedAt = new Date().toISOString();
    return this.serializeCart(cartId);
  }

  private serializeCart(id: string) {
    const cart = this.findCart(id);
    const lines = cart.items.map((line) => {
      const product = this.mockDb.products.find(
        (candidate) => candidate.id === line.productId,
      );
      const variant = product?.variants[0];
      const unitPrice = product?.price ?? 0;

      return {
        id: line.id,
        quantity: line.quantity,
        cost: {
          totalAmount: {
            amount: (unitPrice * line.quantity).toFixed(2),
            currencyCode: cart.currencyCode,
          },
        },
        merchandise: {
          id: line.merchandiseId,
          title: variant?.title ?? 'Default',
          selectedOptions: variant?.selectedOptions ?? [],
          product: product
            ? {
                id: product.id,
                handle: product.handle,
                title: product.title,
                featuredImage: product.featuredImage ?? undefined,
              }
            : undefined,
        },
      };
    });

    const subtotal = lines.reduce(
      (sum, line) => sum + Number.parseFloat(line.cost.totalAmount.amount),
      0,
    );

    return {
      id: cart.id,
      checkoutUrl: '/checkout',
      items: lines,
      lines,
      subtotal: {
        amount: subtotal.toFixed(2),
        currencyCode: cart.currencyCode,
      },
      total: {
        amount: subtotal.toFixed(2),
        currencyCode: cart.currencyCode,
      },
      tax: {
        amount: '0.00',
        currencyCode: cart.currencyCode,
      },
      cost: {
        subtotalAmount: {
          amount: subtotal.toFixed(2),
          currencyCode: cart.currencyCode,
        },
        totalAmount: {
          amount: subtotal.toFixed(2),
          currencyCode: cart.currencyCode,
        },
        totalTaxAmount: {
          amount: '0.00',
          currencyCode: cart.currencyCode,
        },
      },
      totalQuantity: cart.items.reduce((sum, line) => sum + line.quantity, 0),
    };
  }

  private findCart(id: string) {
    const cart = this.mockDb.carts.find((candidate) => candidate.id === id);
    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }

    return cart;
  }

  private findProductByMerchandise(merchandiseId: string) {
    const product =
      this.mockDb.products.find((candidate) => candidate.id === merchandiseId) ??
      this.mockDb.products.find((candidate) =>
        candidate.variants.some((variant) => variant.id === merchandiseId),
      );

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }
}
