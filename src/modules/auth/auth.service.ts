import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AdminUserStatus, AuthProvider, Customer, Prisma } from '@prisma/client';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate } from '../../common/utils/pagination';
import { GoogleCallbackDto, GoogleAuthorizeQueryDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from './password.util';
import { RegisterDto } from './dto/register.dto';

interface GoogleTokenResponse {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

interface GoogleIdTokenClaims {
  iss?: string;
  aud?: string;
  exp?: number;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
  nonce?: string;
}

interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  status: AdminUserStatus;
  lastLoginAt: Date | null;
  role: {
    id: string;
    key: string;
    name: string;
    permissions: Array<{ permission: { key: string; name: string } }>;
  };
}

const adminUserInclude = {
  role: {
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  },
} satisfies Prisma.AdminUserInclude;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(payload: LoginDto) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        email: {
          equals: payload.email,
          mode: 'insensitive',
        },
      },
    });

    if (!customer || !(await verifyPassword(customer.passwordHash, payload.password))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (customer.status !== 'ACTIVE') {
      throw new UnauthorizedException('Customer account is unavailable.');
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return {
      user: this.toCustomerUser(updatedCustomer),
      token: await this.signToken(updatedCustomer.id, updatedCustomer.email, 'customer'),
    };
  }

  async loginAdmin(payload: LoginDto) {
    const admin = await this.prisma.adminUser.findFirst({
      where: {
        email: {
          equals: payload.email,
          mode: 'insensitive',
        },
      },
      include: adminUserInclude,
    });

    if (!admin || !(await verifyPassword(admin.passwordHash, payload.password))) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (admin.status !== 'ACTIVE') {
      throw new UnauthorizedException('Admin account is unavailable.');
    }

    const updatedAdmin = await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
      },
      include: adminUserInclude,
    });

    return {
      user: this.toAdminUser(updatedAdmin),
      token: await this.signToken(updatedAdmin.id, updatedAdmin.email, 'admin'),
    };
  }

  async register(payload: RegisterDto) {
    const exists = await this.prisma.customer.findFirst({
      where: {
        email: {
          equals: payload.email,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException('Email already exists.');
    }

    const customer = await this.prisma.customer.create({
      data: {
        email: payload.email.trim().toLowerCase(),
        passwordHash: await hashPassword(payload.password),
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        lastLoginAt: new Date(),
      },
    });

    return {
      user: this.toCustomerUser(customer),
      token: await this.signToken(customer.id, customer.email, 'customer'),
    };
  }

  getGoogleAuthorizationUrl(query: GoogleAuthorizeQueryDto) {
    if (!this.isGoogleAuthEnabled()) {
      throw new NotFoundException('Google sign-in is not enabled.');
    }

    const params = new URLSearchParams({
      client_id: this.getGoogleClientId(),
      redirect_uri: this.getGoogleRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      state: query.state,
      nonce: query.nonce,
      prompt: 'select_account',
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    };
  }

  async authenticateWithGoogle(payload: GoogleCallbackDto) {
    if (!this.isGoogleAuthEnabled()) {
      throw new NotFoundException('Google sign-in is not enabled.');
    }

    const tokenResponse = await this.exchangeGoogleCode(payload.code);
    const claims = this.parseGoogleIdToken(tokenResponse.id_token);
    this.validateGoogleClaims(claims, payload.nonce);

    const customer = await this.findOrCreateGoogleCustomer(claims);

    return {
      user: this.toCustomerUser(customer),
      token: await this.signToken(customer.id, customer.email, 'customer'),
    };
  }

  async getCurrentUser(request: FastifyRequest) {
    const token = this.extractCustomerToken(request);
    if (!token) {
      throw new UnauthorizedException('Authentication token is required.');
    }

    const payload = this.verifyAuthToken(token);
    if (payload.role !== 'customer') {
      throw new UnauthorizedException('Customer role is required.');
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
    });

    if (!customer || customer.status !== 'ACTIVE') {
      throw new UnauthorizedException('Customer not found.');
    }

    return this.toCustomerUser(customer);
  }

  async tryGetCurrentCustomer(request: FastifyRequest) {
    const token = this.extractCustomerToken(request);
    if (!token) {
      return null;
    }

    try {
      const payload = this.verifyAuthToken(token);
      if (payload.role !== 'customer') {
        return null;
      }

      const customer = await this.prisma.customer.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          status: true,
        },
      });

      if (!customer || customer.status !== 'ACTIVE') {
        return null;
      }

      return customer;
    } catch {
      return null;
    }
  }

  async getCurrentAdmin(request: FastifyRequest) {
    const token = this.extractAdminToken(request);
    if (!token) {
      throw new UnauthorizedException('Authentication token is required.');
    }

    const demoToken = this.configService.get<string>('app.adminDemoToken');
    if (
      this.isDevelopment() &&
      ((demoToken && token === demoToken) || token.startsWith('test_admin_token_'))
    ) {
      const demoAdmin = await this.prisma.adminUser.findFirst({
        include: adminUserInclude,
        orderBy: { createdAt: 'asc' },
      });
      if (!demoAdmin) {
        throw new UnauthorizedException('Admin not found.');
      }

      return this.toAdminUser(demoAdmin);
    }

    const payload = this.verifyAuthToken(token);
    if (payload.role !== 'admin') {
      throw new UnauthorizedException('Admin role is required.');
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
      include: adminUserInclude,
    });

    if (!admin || admin.status !== 'ACTIVE') {
      throw new UnauthorizedException('Admin not found.');
    }

    return this.toAdminUser(admin);
  }

  async listRoles() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return roles.map((role) => ({
      id: role.id,
      key: role.key,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(({ permission }) => ({
        key: permission.key,
        name: permission.name,
      })),
    }));
  }

  async listAdminUsers(query: PaginationQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 20);

    const where: Prisma.AdminUserWhereInput = {
      AND: [
        query.q
          ? {
              OR: [
                {
                  email: {
                    contains: query.q,
                    mode: 'insensitive',
                  },
                },
                {
                  name: {
                    contains: query.q,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {},
        query.status
          ? {
              status: query.status as AdminUserStatus,
            }
          : {},
      ],
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.adminUser.findMany({
        where,
        include: adminUserInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.adminUser.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toAdminUser(item)),
      total,
      page,
      pageSize,
    };
  }

  async createAdminUser(payload: {
    email: string;
    name: string;
    password: string;
    roleId: string;
    status?: AdminUserStatus;
  }) {
    const role = await this.prisma.role.findUnique({
      where: { id: payload.roleId },
    });

    if (!role) {
      throw new BadRequestException('Role not found.');
    }

    const exists = await this.prisma.adminUser.findFirst({
      where: {
        email: {
          equals: payload.email,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException('Admin email already exists.');
    }

    const admin = await this.prisma.adminUser.create({
      data: {
        email: payload.email.trim().toLowerCase(),
        name: payload.name.trim(),
        passwordHash: await hashPassword(payload.password),
        roleId: payload.roleId,
        status: payload.status ?? 'ACTIVE',
      },
      include: adminUserInclude,
    });

    return this.toAdminUser(admin);
  }

  async updateAdminUser(
    id: string,
    payload: {
      name?: string;
      password?: string;
      roleId?: string;
      status?: AdminUserStatus;
    },
  ) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Admin user not found.');
    }

    if (payload.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: payload.roleId },
        select: { id: true },
      });

      if (!role) {
        throw new BadRequestException('Role not found.');
      }
    }

    const admin = await this.prisma.adminUser.update({
      where: { id },
      data: {
        name: payload.name?.trim(),
        roleId: payload.roleId,
        status: payload.status,
        passwordHash: payload.password
          ? await hashPassword(payload.password)
          : undefined,
      },
      include: adminUserInclude,
    });

    return this.toAdminUser(admin);
  }

  private extractCustomerToken(request: FastifyRequest) {
    return this.extractToken(request, 'auth_token');
  }

  private extractAdminToken(request: FastifyRequest) {
    return this.extractToken(request, 'admin_token');
  }

  private extractToken(request: FastifyRequest, cookieName: string) {
    const cookies = (request as FastifyRequest & {
      cookies?: Record<string, string>;
    }).cookies;
    const authorization = request.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice(7);
    }

    return cookies?.[cookieName];
  }

  private isDevelopment() {
    return this.configService.get<string>('app.nodeEnv') === 'development';
  }

  private isGoogleAuthEnabled() {
    return this.configService.get<boolean>('app.googleAuthEnabled') === true;
  }

  private getGoogleClientId() {
    const clientId = this.configService.get<string>('app.googleClientId');
    if (!clientId) {
      throw new NotFoundException('Google client id is not configured.');
    }

    return clientId;
  }

  private getGoogleClientSecret() {
    const clientSecret = this.configService.get<string>('app.googleClientSecret');
    if (!clientSecret) {
      throw new NotFoundException('Google client secret is not configured.');
    }

    return clientSecret;
  }

  private getGoogleRedirectUri() {
    const redirectUri = this.configService.get<string>('app.googleRedirectUri');
    if (!redirectUri) {
      throw new NotFoundException('Google redirect uri is not configured.');
    }

    return redirectUri;
  }

  private async signToken(
    sub: string,
    email: string,
    role: 'admin' | 'customer',
  ) {
    return this.jwtService.signAsync(
      { sub, email, role },
      {
        secret: this.configService.get<string>('app.jwtSecret'),
        expiresIn: '7d',
      },
    );
  }

  private verifyAuthToken(token: string) {
    return this.jwtService.verify<{
      sub: string;
      email: string;
      role: 'admin' | 'customer';
    }>(token, {
      secret: this.configService.get<string>('app.jwtSecret'),
    });
  }

  private async exchangeGoogleCode(code: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.getGoogleClientId(),
        client_secret: this.getGoogleClientSecret(),
        redirect_uri: this.getGoogleRedirectUri(),
        grant_type: 'authorization_code',
      }).toString(),
    });

    const data = (await response.json().catch(() => ({}))) as GoogleTokenResponse;
    if (!response.ok || !data.id_token) {
      throw new UnauthorizedException(
        data.error_description || 'Failed to exchange Google authorization code.',
      );
    }

    return data;
  }

  private parseGoogleIdToken(idToken?: string) {
    if (!idToken) {
      throw new UnauthorizedException('Google ID token is missing.');
    }

    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Google ID token is invalid.');
    }

    try {
      return JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf8'),
      ) as GoogleIdTokenClaims;
    } catch {
      throw new UnauthorizedException('Google ID token payload is invalid.');
    }
  }

  private validateGoogleClaims(claims: GoogleIdTokenClaims, nonce: string) {
    const now = Math.floor(Date.now() / 1000);
    const issuer = claims.iss;

    if (!claims.sub || !claims.email) {
      throw new UnauthorizedException(
        'Google account does not include the required identity claims.',
      );
    }

    if (claims.aud !== this.getGoogleClientId()) {
      throw new UnauthorizedException('Google token audience mismatch.');
    }

    if (
      issuer !== 'https://accounts.google.com' &&
      issuer !== 'accounts.google.com'
    ) {
      throw new UnauthorizedException('Google token issuer is invalid.');
    }

    if (!claims.exp || claims.exp <= now) {
      throw new UnauthorizedException('Google token has expired.');
    }

    if (claims.email_verified !== true) {
      throw new UnauthorizedException('Google email must be verified.');
    }

    if (!claims.nonce || claims.nonce !== nonce) {
      throw new UnauthorizedException('Google nonce validation failed.');
    }
  }

  private async findOrCreateGoogleCustomer(claims: GoogleIdTokenClaims) {
    const googleSub = claims.sub!;
    const email = claims.email!.toLowerCase();
    const now = new Date();

    const admin = await this.prisma.adminUser.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });
    if (admin) {
      throw new BadRequestException(
        'Google storefront sign-in cannot be used with admin accounts.',
      );
    }

    let customer =
      (await this.prisma.customer.findUnique({ where: { googleSub } })) ??
      (await this.prisma.customer.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
      }));

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          email,
          passwordHash: await hashPassword(randomUUID()),
          authProvider: 'GOOGLE',
          googleSub,
          avatarUrl: claims.picture,
          firstName: claims.given_name,
          lastName: claims.family_name,
          lastLoginAt: now,
        },
      });

      return customer;
    }

    if (customer.googleSub && customer.googleSub !== googleSub) {
      throw new BadRequestException(
        'This email is already linked to a different Google account.',
      );
    }

    return this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        authProvider: 'GOOGLE',
        googleSub,
        email,
        avatarUrl: claims.picture,
        firstName: claims.given_name ?? customer.firstName,
        lastName: claims.family_name ?? customer.lastName,
        lastLoginAt: now,
      },
    });
  }

  private toAdminUser(admin: AdminUserRecord) {
    const permissions = admin.role.permissions.map(({ permission }) => permission.key);

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'admin' as const,
      adminRole: admin.role.key,
      permissions,
      lastLoginAt: admin.lastLoginAt?.toISOString() ?? undefined,
    };
  }

  private toCustomerUser(customer: Customer & {
    authProvider?: AuthProvider;
    avatarUrl?: string | null;
  }) {
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName ?? undefined,
      lastName: customer.lastName ?? undefined,
      phone: customer.phone ?? undefined,
      avatarUrl: customer.avatarUrl ?? undefined,
      authProvider: customer.authProvider.toLowerCase(),
      role: 'customer' as const,
      lastLoginAt: customer.lastLoginAt?.toISOString() ?? undefined,
    };
  }
}
