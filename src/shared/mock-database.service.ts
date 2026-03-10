import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { createMockSeed } from './mock-seed';

@Injectable()
export class MockDatabaseService {
  private readonly state = createMockSeed();

  readonly admins = this.state.admins;
  readonly brands = this.state.brands;
  readonly carts = this.state.carts;
  readonly collections = this.state.collections;
  readonly customers = this.state.customers;
  readonly menus = this.state.menus;
  readonly orders = this.state.orders;
  readonly pages = this.state.pages;
  readonly products = this.state.products;

  createId(prefix: string): string {
    return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
}
