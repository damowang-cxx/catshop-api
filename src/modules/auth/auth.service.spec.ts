import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';
import { verifyPassword } from './password.util';

function createCustomerRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'customer-1',
    email: 'alice@example.com',
    passwordHash:
      '$argon2id$v=19$m=19456,t=2,p=1$Bh4xCTD/UFX8zOYBLGFzRQ$kncUvnvrxHS029pbkfEEeq0FIhPQ1UeC1d7Z/2V0poA',
    firstName: 'Alice',
    lastName: 'Shopper',
    phone: '+1 555 0101',
    status: 'ACTIVE',
    authProvider: 'LOCAL',
    avatarUrl: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createAdminRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'admin-1',
    email: 'admin@example.com',
    passwordHash:
      '$argon2id$v=19$m=19456,t=2,p=1$5msT9CblrNrv7razUCSHvg$9fJcm9kEWSOl/dtIoagTV9o9GU7do3QkcaTgw+4PlTg',
    name: 'Primary Admin',
    status: 'ACTIVE',
    lastLoginAt: null,
    role: {
      key: 'super_admin',
      permissions: [
        { permission: { key: 'admins.read', name: 'Admins Read' } },
        { permission: { key: 'admins.write', name: 'Admins Write' } },
      ],
    },
    ...overrides,
  };
}

describe('AuthService', () => {
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;
  let prisma: {
    customer: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
    };
    adminUser: {
      findFirst: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
    };
    role: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let authService: AuthService;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string | boolean> = {
          'app.nodeEnv': 'development',
          'app.jwtSecret': 'jwt-secret',
          'app.adminDemoToken': 'test_admin_token',
          'app.googleAuthEnabled': false,
          'app.googleClientId': 'google-client-id',
          'app.googleClientSecret': 'google-client-secret',
          'app.googleRedirectUri':
            'http://localhost:3000/api/auth/google/callback',
        };

        return values[key] as never;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    prisma = {
      customer: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      adminUser: {
        findFirst: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    authService = new AuthService(
      prisma as unknown as PrismaService,
      jwtService,
      configService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('register hashes passwords and omits password fields from responses', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);
    prisma.customer.create.mockImplementation(async ({ data }) =>
      createCustomerRecord({
        id: 'customer-2',
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? null,
        lastLoginAt: data.lastLoginAt,
      }),
    );

    const response = await authService.register({
      email: 'new-user@example.com',
      password: 'supersecure123',
      firstName: 'New',
      lastName: 'User',
    });

    const createdArgs = prisma.customer.create.mock.calls[0][0].data;
    expect(createdArgs.passwordHash).toMatch(/^\$argon2id\$/);
    expect(createdArgs.passwordHash).not.toBe('supersecure123');
    await expect(
      verifyPassword(createdArgs.passwordHash, 'supersecure123'),
    ).resolves.toBe(true);

    expect(response).toMatchObject({
      token: 'signed-token',
      user: {
        email: 'new-user@example.com',
        role: 'customer',
      },
    });
    expect(response.user).not.toHaveProperty('password');
    expect(response.user).not.toHaveProperty('passwordHash');
  });

  it('verifies hashed customer passwords during login', async () => {
    const customer = createCustomerRecord();
    prisma.customer.findFirst.mockResolvedValue(customer);
    prisma.customer.update.mockResolvedValue({
      ...customer,
      lastLoginAt: new Date(),
    });

    const response = await authService.login({
      email: 'alice@example.com',
      password: 'password123',
    });

    expect(response).toMatchObject({
      token: 'signed-token',
      user: {
        email: 'alice@example.com',
        role: 'customer',
      },
    });
    expect(response.user).not.toHaveProperty('password');
    expect(response.user).not.toHaveProperty('passwordHash');
  });

  it('verifies hashed admin passwords during admin login', async () => {
    const admin = createAdminRecord();
    prisma.adminUser.findFirst.mockResolvedValue(admin);
    prisma.adminUser.update.mockResolvedValue({
      ...admin,
      lastLoginAt: new Date(),
    });

    const response = await authService.loginAdmin({
      email: 'admin@example.com',
      password: 'admin123',
    });

    expect(response).toMatchObject({
      token: 'signed-token',
      user: {
        email: 'admin@example.com',
        role: 'admin',
        adminRole: 'super_admin',
      },
    });
  });

  it('rejects invalid passwords', async () => {
    prisma.customer.findFirst.mockResolvedValue(createCustomerRecord());

    await expect(
      authService.login({
        email: 'alice@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects duplicate registrations', async () => {
    prisma.customer.findFirst.mockResolvedValue({ id: 'customer-1' });

    await expect(
      authService.register({
        email: 'alice@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
