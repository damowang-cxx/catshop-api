import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { FastifyRequest } from 'fastify';
import { MockDatabaseService } from '../../shared/mock-database.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly mockDb: MockDatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(payload: LoginDto) {
    const admin = this.mockDb.admins.find(
      (candidate) =>
        candidate.email.toLowerCase() === payload.email.toLowerCase() &&
        candidate.password === payload.password,
    );

    if (admin) {
      return {
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
        token: await this.signToken(admin.id, admin.email, 'admin'),
      };
    }

    const customer = this.mockDb.customers.find(
      (candidate) =>
        candidate.email.toLowerCase() === payload.email.toLowerCase() &&
        candidate.password === payload.password,
    );

    if (!customer) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    customer.lastLoginAt = new Date().toISOString();

    return {
      user: this.toCustomerUser(customer),
      token: await this.signToken(customer.id, customer.email, 'customer'),
    };
  }

  async register(payload: RegisterDto) {
    const exists = this.mockDb.customers.some(
      (customer) => customer.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (exists) {
      throw new ConflictException('Email already exists.');
    }

    const customer = {
      id: this.mockDb.createId('cus'),
      email: payload.email,
      password: payload.password,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      status: 'active' as const,
      lastLoginAt: new Date().toISOString(),
    };

    this.mockDb.customers.push(customer);

    return {
      user: this.toCustomerUser(customer),
      token: await this.signToken(customer.id, customer.email, 'customer'),
    };
  }

  getCurrentUser(request: FastifyRequest) {
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Authentication token is required.');
    }

    const payload = this.jwtService.verify<{
      sub: string;
      email: string;
      role: 'admin' | 'customer';
    }>(token, {
      secret: this.configService.get<string>('app.jwtSecret'),
    });

    if (payload.role === 'admin') {
      const admin = this.mockDb.admins.find((candidate) => candidate.id === payload.sub);
      if (!admin) {
        throw new UnauthorizedException('Admin not found.');
      }

      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      };
    }

    const customer = this.mockDb.customers.find(
      (candidate) => candidate.id === payload.sub,
    );
    if (!customer) {
      throw new UnauthorizedException('Customer not found.');
    }

    return this.toCustomerUser(customer);
  }

  extractToken(request: FastifyRequest) {
    const cookies = (request as FastifyRequest & {
      cookies?: Record<string, string>;
    }).cookies;
    const authorization = request.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice(7);
    }

    return cookies?.auth_token ?? cookies?.admin_token;
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

  private toCustomerUser(customer: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
    };
  }
}
