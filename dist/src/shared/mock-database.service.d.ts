export declare class MockDatabaseService {
    private readonly state;
    readonly admins: import("../common/types/domain.types").AdminRecord[];
    readonly brands: import("../common/types/domain.types").BrandRecord[];
    readonly carts: import("../common/types/domain.types").CartRecord[];
    readonly collections: import("../common/types/domain.types").CollectionRecord[];
    readonly customers: import("../common/types/domain.types").CustomerRecord[];
    readonly menus: import("../common/types/domain.types").MenuRecord[];
    readonly orders: import("../common/types/domain.types").OrderRecord[];
    readonly pages: import("../common/types/domain.types").PageRecord[];
    readonly products: import("../common/types/domain.types").ProductRecord[];
    createId(prefix: string): string;
}
