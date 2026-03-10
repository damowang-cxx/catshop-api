import { AdminRecord, BrandRecord, CartRecord, CollectionRecord, CustomerRecord, MenuRecord, OrderRecord, PageRecord, ProductRecord } from '../common/types/domain.types';
export interface MockSeedData {
    admins: AdminRecord[];
    brands: BrandRecord[];
    carts: CartRecord[];
    collections: CollectionRecord[];
    customers: CustomerRecord[];
    menus: MenuRecord[];
    orders: OrderRecord[];
    pages: PageRecord[];
    products: ProductRecord[];
}
export declare function createMockSeed(): MockSeedData;
