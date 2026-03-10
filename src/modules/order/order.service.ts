import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { paginate } from '../../common/utils/pagination';
import { MockDatabaseService } from '../../shared/mock-database.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateReturnDto } from './dto/create-return.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly mockDb: MockDatabaseService,
    private readonly cartService: CartService,
  ) {}

  listOrders(query: OrderQueryDto, adminView = false) {
    let orders = [...this.mockDb.orders];

    if (query.q) {
      const keyword = query.q.toLowerCase();
      orders = orders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(keyword) ||
          order.customerName?.toLowerCase().includes(keyword) ||
          order.customerEmail?.toLowerCase().includes(keyword),
      );
    }

    if (query.status) {
      orders = orders.filter((order) => order.status === query.status);
    }

    orders.sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );

    if (!adminView) {
      return orders.map((order) => this.serializeOrder(order.id));
    }

    return paginate(
      orders.map((order) => this.serializeOrder(order.id)),
      query,
    );
  }

  getOrder(id: string) {
    return this.serializeOrder(id);
  }

  createOrder(payload: CreateOrderDto) {
    const sourceItems = payload.cartId
      ? this.extractItemsFromCart(payload.cartId)
      : payload.items?.map((item) => ({
          productId: item.productId,
          quantity: Number.parseInt(item.quantity, 10) || 1,
        })) ?? [];

    if (sourceItems.length === 0) {
      throw new BadRequestException('At least one checkout item is required.');
    }

    const items = sourceItems.map((item) => {
      const product = this.mockDb.products.find(
        (candidate) => candidate.id === item.productId,
      );
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found.`);
      }
      if (product.inventory < item.quantity) {
        throw new BadRequestException(
          `Insufficient inventory for ${product.title}.`,
        );
      }

      product.inventory -= item.quantity;
      product.updatedAt = new Date().toISOString();

      return {
        id: this.mockDb.createId('item'),
        productId: product.id,
        productHandle: product.handle,
        productTitle: product.title,
        image: product.featuredImage?.url,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shipping = subtotal > 80 ? 0 : 8;
    const tax = Number((subtotal * 0.08).toFixed(2));
    const now = new Date().toISOString();
    const order = {
      id: this.mockDb.createId('ord'),
      orderNumber: `${1000 + this.mockDb.orders.length + 1}`,
      customerName: payload.customerName ?? 'Guest Checkout',
      customerEmail: payload.customerEmail,
      subtotal,
      shipping,
      tax,
      total: Number((subtotal + shipping + tax).toFixed(2)),
      currencyCode: 'USD',
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      shippingAddress: payload.shippingAddress,
      items,
      notes: [],
      logs: [`${now} system created order.`],
      createdAt: now,
      updatedAt: now,
    };

    this.mockDb.orders.unshift(order);
    return this.serializeOrder(order.id);
  }

  updateOrderStatus(id: string, payload: UpdateOrderStatusDto) {
    const order = this.findOrder(id);
    order.status = payload.status;
    order.updatedAt = new Date().toISOString();
    order.logs.unshift(
      `${new Date().toISOString()} admin updated order status to ${payload.status}.`,
    );
    return this.serializeOrder(id);
  }

  applyBulkAction(payload: BulkActionRequestDto) {
    if (payload.action !== 'updateStatus' || !payload.status) {
      throw new BadRequestException('Only updateStatus is supported for orders.');
    }

    payload.ids.forEach((id) => {
      const order = this.findOrder(id);
      order.status = payload.status as typeof order.status;
      order.updatedAt = new Date().toISOString();
      order.logs.unshift(
        `${new Date().toISOString()} admin bulk updated order status to ${payload.status}.`,
      );
    });

    return { updated: payload.ids.length };
  }

  createShipment(id: string, payload: CreateShipmentDto) {
    const order = this.findOrder(id);
    order.status = 'shipped';
    order.updatedAt = new Date().toISOString();
    order.logs.unshift(
      `${new Date().toISOString()} admin created shipment ${payload.trackingNumber} via ${payload.carrier}.`,
    );
    return this.serializeOrder(id);
  }

  createReturn(id: string, payload: CreateReturnDto) {
    const order = this.findOrder(id);
    order.updatedAt = new Date().toISOString();
    order.logs.unshift(
      `${new Date().toISOString()} admin created return request: ${payload.reason}.`,
    );
    return {
      id: this.mockDb.createId('ret'),
      orderId: id,
      status: 'requested',
      reason: payload.reason,
      createdAt: new Date().toISOString(),
    };
  }

  private serializeOrder(id: string) {
    const order = this.findOrder(id);

    return {
      ...order,
      totalPrice: {
        amount: order.total.toFixed(2),
        currencyCode: order.currencyCode,
      },
      lineItems: order.items.map((item) => ({
        id: item.id,
        title: item.productTitle,
        quantity: item.quantity,
        variant: {
          id: item.productId,
          title: 'Default',
          price: {
            amount: item.price.toFixed(2),
            currencyCode: order.currencyCode,
          },
        },
        product: {
          id: item.productId,
          handle: item.productHandle,
          title: item.productTitle,
          featuredImage: item.image ? { url: item.image } : null,
        },
      })),
    };
  }

  private findOrder(id: string) {
    const order = this.mockDb.orders.find((candidate) => candidate.id === id);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
  }

  private extractItemsFromCart(cartId: string) {
    const cart = this.cartService.getCart(cartId);
    return cart.lines.map(
      (line: {
        merchandise: { product?: { id?: string } };
        quantity: number;
      }) => ({
        productId: line.merchandise.product?.id ?? '',
        quantity: line.quantity,
      }),
    );
  }
}
