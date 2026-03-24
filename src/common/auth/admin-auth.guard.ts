import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../../prisma/prisma.service';
import type { PermissionKey } from './permissions.constants';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest & {
      cookies?: Record<string, string>;
      admin?: {
        id: string;
        email: string;
        name: string;
        adminRole: string;
        permissions: PermissionKey[];
      };
    }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Admin token is required.');
    }

    const admin = await this.resolveAdminFromToken(token);
    request.admin = admin;
    return true;
  }

  private extractToken(
    request: FastifyRequest & { cookies?: Record<string, string> },
  ) {
    const authHeader = request.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;
    const cookieToken = request.cookies?.admin_token;
    return bearerToken ?? cookieToken;
  }

  private async resolveAdminFromToken(token: string) {
    const demoToken = this.configService.get<string>('app.adminDemoToken');
    if (
      this.isDevelopment() &&
      ((demoToken && token === demoToken) || token.startsWith('test_admin_token_'))
    ) {
      const demoAdmin = await this.prisma.adminUser.findFirst({
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (!demoAdmin) {
        throw new UnauthorizedException('Admin not found.');
      }

      return this.serializeAdmin(demoAdmin);
    }

    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        role: string;
      }>(token, {
        secret: this.configService.get<string>('app.jwtSecret'),
      });

      if (payload.role !== 'admin') {
        throw new UnauthorizedException('Admin role is required.');
      }

      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!admin || admin.status === 'DISABLED') {
        throw new UnauthorizedException('Admin account is unavailable.');
      }

      return this.serializeAdmin(admin);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid admin token.');
    }
  }

  private serializeAdmin(admin: {
    id: string;
    email: string;
    name: string;
    role: {
      key: string;
      permissions: Array<{ permission: { key: string } }>;
    };
  }) {
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      adminRole: admin.role.key,
      permissions: admin.role.permissions.map(
        ({ permission }) => permission.key as PermissionKey,
      ),
    };
  }

  private isDevelopment() {
    return this.configService.get<string>('app.nodeEnv') === 'development';
  }
}
