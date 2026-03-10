import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../shared/mock-database.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly mockDb: MockDatabaseService) {}

  getAdminStats() {
    const revenue = this.mockDb.orders.reduce((sum, order) => sum + order.total, 0);
    const lowStockCount = this.mockDb.products.filter(
      (product) => product.inventory <= 10,
    ).length;

    return {
      products: this.mockDb.products.length,
      collections: this.mockDb.collections.length,
      orders: this.mockDb.orders.length,
      customers: this.mockDb.customers.length,
      revenue: Number(revenue.toFixed(2)),
      lowStockCount,
    };
  }

  getOverview() {
    return {
      range: 'last_30_days',
      revenue: this.mockDb.orders.reduce((sum, order) => sum + order.total, 0),
      orders: this.mockDb.orders.length,
      newCustomers: this.mockDb.customers.length,
      conversionRate: 2.8,
    };
  }

  getSales() {
    return {
      topProducts: this.mockDb.products
        .map((product) => ({
          id: product.id,
          title: product.title,
          revenue: this.mockDb.orders.reduce((sum, order) => {
            const sold = order.items.find((item) => item.productId === product.id);
            return sum + (sold ? sold.price * sold.quantity : 0);
          }, 0),
        }))
        .sort((left, right) => right.revenue - left.revenue)
        .slice(0, 5),
    };
  }

  getTraffic() {
    return {
      uv: 1842,
      pv: 6120,
      mobileShare: 71,
      topCountries: [
        { country: 'US', visits: 840 },
        { country: 'CA', visits: 310 },
        { country: 'FR', visits: 240 },
      ],
    };
  }

  getChannels() {
    return {
      channels: [
        { source: 'organic_search', visits: 720, orders: 38, revenue: 2840 },
        { source: 'instagram', visits: 410, orders: 21, revenue: 1510 },
        { source: 'email', visits: 166, orders: 14, revenue: 1092 },
      ],
    };
  }
}
