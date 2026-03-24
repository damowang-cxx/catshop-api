import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import {
  PERMISSIONS_METADATA_KEY,
} from './permissions.decorator';
import type { PermissionKey } from './permissions.constants';

interface AuthenticatedAdmin {
  id: string;
  email: string;
  adminRole: string;
  permissions: PermissionKey[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionKey[]>(
      PERMISSIONS_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest & {
      admin?: AuthenticatedAdmin;
    }>();
    const admin = request.admin;

    if (!admin) {
      throw new ForbiddenException('Admin session is not available.');
    }

    if (admin.permissions.includes('*' as PermissionKey)) {
      return true;
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      admin.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }

    return true;
  }
}
