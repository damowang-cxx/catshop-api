export const PERMISSIONS = {
  catalogRead: 'catalog.read',
  catalogWrite: 'catalog.write',
  ordersRead: 'orders.read',
  ordersWrite: 'orders.write',
  customersRead: 'customers.read',
  inventoryRead: 'inventory.read',
  inventoryWrite: 'inventory.write',
  analyticsRead: 'analytics.read',
  adminsRead: 'admins.read',
  adminsWrite: 'admins.write',
} as const;

export type PermissionKey =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSION_MAP: Record<string, PermissionKey[]> = {
  super_admin: Object.values(PERMISSIONS),
  catalog_manager: [
    PERMISSIONS.catalogRead,
    PERMISSIONS.catalogWrite,
    PERMISSIONS.inventoryRead,
    PERMISSIONS.inventoryWrite,
  ],
  support_agent: [
    PERMISSIONS.ordersRead,
    PERMISSIONS.ordersWrite,
    PERMISSIONS.customersRead,
  ],
};
