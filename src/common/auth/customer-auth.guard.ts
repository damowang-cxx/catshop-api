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

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest & {
      cookies?: Record<string, string>;
      customer?: { id: string; email: string };
    }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is required.');
    }

    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        role: string;
      }>(token, {
        secret: this.configService.get<string>('app.jwtSecret'),
      });

      if (payload.role !== 'customer') {
        throw new UnauthorizedException('Customer role is required.');
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
        throw new UnauthorizedException('Customer account is unavailable.');
      }

      request.customer = {
        id: customer.id,
        email: customer.email,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid authentication token.');
    }
  }

  private extractToken(
    request: FastifyRequest & { cookies?: Record<string, string> },
  ) {
    const authorization = request.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice(7);
    }

    return request.cookies?.auth_token;
  }
}
