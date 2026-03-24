import type { PermissionKey } from './permissions.constants';
export declare const PERMISSIONS_METADATA_KEY = "permissions";
export declare const RequiresPermissions: (...permissions: PermissionKey[]) => import("@nestjs/common").CustomDecorator<string>;
