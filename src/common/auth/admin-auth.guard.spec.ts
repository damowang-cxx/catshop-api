import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminAuthGuard } from './admin-auth.guard';

function createExecutionContext(token?: string) {
  const request = {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    cookies: {},
  } as unknown as FastifyRequest;

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

function createAdminRecord() {
  return {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Primary Admin',
    status: 'ACTIVE',
    role: {
      key: 'super_admin',
      permissions: [
        {
          permission: {
            key: 'admins.read',
          },
        },
      ],
    },
  };
}

describe('AdminAuthGuard', () => {
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;
  let prisma: {
    adminUser: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
    };
  };
  let guard: AdminAuthGuard;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'app.nodeEnv': 'development',
          'app.adminDemoToken': 'test_admin_token',
          'app.jwtSecret': 'jwt-secret',
        };

        return values[key];
      }),
    } as unknown as jest.Mocked<ConfigService>;

    jwtService = {
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    prisma = {
      adminUser: {
        findFirst: jest.fn().mockResolvedValue(createAdminRecord()),
        findUnique: jest.fn().mockResolvedValue(createAdminRecord()),
      },
    };

    guard = new AdminAuthGuard(
      configService,
      jwtService,
      prisma as unknown as PrismaService,
    );
  });

  it('allows demo tokens in development', async () => {
    await expect(
      guard.canActivate(createExecutionContext('test_admin_token')),
    ).resolves.toBe(true);
    expect(jwtService.verify).not.toHaveBeenCalled();
  });

  it('allows prefixed test tokens in development', async () => {
    await expect(
      guard.canActivate(createExecutionContext('test_admin_token_debug')),
    ).resolves.toBe(true);
    expect(jwtService.verify).not.toHaveBeenCalled();
  });

  it('rejects demo tokens in production', async () => {
    configService.get.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        'app.nodeEnv': 'production',
        'app.adminDemoToken': '',
        'app.jwtSecret': 'jwt-secret',
      };

      return values[key];
    });
    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    await expect(
      guard.canActivate(createExecutionContext('test_admin_token_debug')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('allows valid admin JWTs', async () => {
    jwtService.verify.mockReturnValue({
      sub: 'admin-1',
      email: 'admin@example.com',
      role: 'admin',
    } as never);

    await expect(
      guard.canActivate(createExecutionContext('signed-admin-jwt')),
    ).resolves.toBe(true);
    expect(prisma.adminUser.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'admin-1' },
      }),
    );
  });

  it('rejects customer JWTs', async () => {
    jwtService.verify.mockReturnValue({
      sub: 'customer-1',
      email: 'alice@example.com',
      role: 'customer',
    } as never);

    await expect(
      guard.canActivate(createExecutionContext('signed-customer-jwt')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
