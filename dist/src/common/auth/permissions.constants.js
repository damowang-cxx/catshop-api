"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSION_MAP = exports.PERMISSIONS = void 0;
exports.PERMISSIONS = {
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
};
exports.ROLE_PERMISSION_MAP = {
    super_admin: Object.values(exports.PERMISSIONS),
    catalog_manager: [
        exports.PERMISSIONS.catalogRead,
        exports.PERMISSIONS.catalogWrite,
        exports.PERMISSIONS.inventoryRead,
        exports.PERMISSIONS.inventoryWrite,
    ],
    support_agent: [
        exports.PERMISSIONS.ordersRead,
        exports.PERMISSIONS.ordersWrite,
        exports.PERMISSIONS.customersRead,
    ],
};
//# sourceMappingURL=permissions.constants.js.map