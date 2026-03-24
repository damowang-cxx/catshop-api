import { SetMetadata } from '@nestjs/common';
import type { PermissionKey } from './permissions.constants';

export const PERMISSIONS_METADATA_KEY = 'permissions';

export const RequiresPermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_METADATA_KEY, permissions);
