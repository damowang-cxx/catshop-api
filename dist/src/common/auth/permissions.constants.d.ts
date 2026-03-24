export declare const PERMISSIONS: {
    readonly catalogRead: "catalog.read";
    readonly catalogWrite: "catalog.write";
    readonly ordersRead: "orders.read";
    readonly ordersWrite: "orders.write";
    readonly customersRead: "customers.read";
    readonly inventoryRead: "inventory.read";
    readonly inventoryWrite: "inventory.write";
    readonly analyticsRead: "analytics.read";
    readonly adminsRead: "admins.read";
    readonly adminsWrite: "admins.write";
};
export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export declare const ROLE_PERMISSION_MAP: Record<string, PermissionKey[]>;
