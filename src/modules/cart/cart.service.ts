import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddCartLinesDto } from './dto/add-cart-lines.dto';
import { RemoveCartLinesDto } from './dto/remove-cart-lines.dto';

const DEFAULT_CURRENCY = 'USD';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async createCart(customerId?: string) {
    const cart = await this.prisma.cart.create({
      data: {
        currency: DEFAULT_CURRENCY,
        customerId: customerId ?? null,
      },
    });

    return this.serializeCart(cart.id, customerId);
  }

  async getCart(id: string, customerId?: string) {
    return this.serializeCart(id, customerId);
  }

  async addLines(cartId: string, payload: AddCartLinesDto, customerId?: string) {
    const cart = await this.findCart(cartId, customerId, true);

    for (const line of payload.lines) {
      const variant = await this.findVariantByMerchandise(line.merchandiseId);
      const existing = await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          variantId: variant.id,
        },
      });

      if (existing) {
        await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + line.quantity,
          },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: variant.productId,
            variantId: variant.id,
            quantity: line.quantity,
          },
        });
      }
    }

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.serializeCart(cart.id, customerId);
  }

  async updateLines(cartId: string, payload: AddCartLinesDto, customerId?: string) {
    const cart = await this.findCart(cartId, customerId, true);

    for (const line of payload.lines) {
      if (!line.id) {
        continue;
      }

      const existing = await this.prisma.cartItem.findFirst({
        where: {
          id: line.id,
          cartId: cart.id,
        },
      });

      if (!existing) {
        continue;
      }

      const variant = await this.findVariantByMerchandise(line.merchandiseId);
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          variantId: variant.id,
          productId: variant.productId,
          quantity: line.quantity,
        },
      });
    }

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return this.serializeCart(cart.id, customerId);
  }

  async removeLines(
    cartId: string,
    payload: RemoveCartLinesDto,
    customerId?: string,
  ) {
    const cart = await this.findCart(cartId, customerId, true);
    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        id: {
          in: payload.lineIds,
        },
      },
    });
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });
    return this.serializeCart(cart.id, customerId);
  }

  async clearCart(cartId: string, customerId?: string) {
    const cart = await this.findCart(cartId, customerId, true);
    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });
  }

  private async serializeCart(id: string, customerId?: string) {
    const cart = await this.findCart(id, customerId, true);
    const fullCart = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { position: 'asc' },
                },
                translations: {
                  where: {
                    locale: 'zh',
                  },
                },
              },
            },
            variant: {
              include: {
                prices: true,
                optionValues: {
                  include: {
                    option: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!fullCart) {
      throw new NotFoundException('Cart not found.');
    }

    const lines = fullCart.items.map((line) => {
      const unitPrice = Number(
        line.variant?.prices.find((price) => price.currency === DEFAULT_CURRENCY)
          ?.amount ?? 0,
      );
      const translation = line.product?.translations[0];
      const featuredImage = line.product?.images.find((image) => image.isPrimary) ??
        line.product?.images[0];

      return {
        id: line.id,
        quantity: line.quantity,
        cost: {
          totalAmount: {
            amount: (unitPrice * line.quantity).toFixed(2),
            currencyCode: fullCart.currency,
          },
        },
        merchandise: {
          id: line.variantId ?? line.productId ?? '',
          title: line.variant?.title ?? 'Default',
          selectedOptions:
            line.variant?.optionValues.map((optionValue) => ({
              name: optionValue.option.name,
              value: optionValue.value,
            })) ?? [],
          product: line.product
            ? {
                id: line.product.id,
                handle: line.product.handle,
                title: translation?.title ?? line.product.handle,
                featuredImage: featuredImage
                  ? {
                      url: featuredImage.url,
                      altText: featuredImage.altText ?? '',
                      width: 800,
                      height: 800,
                    }
                  : null,
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
      id: fullCart.id,
      checkoutUrl: '/checkout',
      items: lines,
      lines,
      subtotal: {
        amount: subtotal.toFixed(2),
        currencyCode: fullCart.currency,
      },
      total: {
        amount: subtotal.toFixed(2),
        currencyCode: fullCart.currency,
      },
      tax: {
        amount: '0.00',
        currencyCode: fullCart.currency,
      },
      cost: {
        subtotalAmount: {
          amount: subtotal.toFixed(2),
          currencyCode: fullCart.currency,
        },
        totalAmount: {
          amount: subtotal.toFixed(2),
          currencyCode: fullCart.currency,
        },
        totalTaxAmount: {
          amount: '0.00',
          currencyCode: fullCart.currency,
        },
      },
      totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    };
  }

  private async findCart(
    id: string,
    customerId?: string,
    bindAnonymousCart = false,
  ) {
    const cart = await this.prisma.cart.findUnique({
      where: { id },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found.');
    }

    if (cart.customerId && customerId && cart.customerId !== customerId) {
      throw new ForbiddenException('Cart belongs to a different customer.');
    }

    if (!cart.customerId && customerId && bindAnonymousCart) {
      return this.prisma.cart.update({
        where: { id },
        data: {
          customerId,
        },
      });
    }

    return cart;
  }

  private async findVariantByMerchandise(merchandiseId: string) {
    const directVariant = await this.prisma.productVariant.findUnique({
      where: { id: merchandiseId },
      include: {
        product: true,
      },
    });
    if (directVariant) {
      return directVariant;
    }

    const product = await this.prisma.product.findUnique({
      where: { id: merchandiseId },
      include: {
        variants: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!product || product.variants.length === 0) {
      throw new NotFoundException('Product not found.');
    }

    return product.variants[0];
  }
}
