import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminAuthGuard implements CanActivate {
    private readonly configService;
    private readonly jwtService;
    private readonly prisma;
    constructor(configService: ConfigService, jwtService: JwtService, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractToken;
    private resolveAdminFromToken;
    private serializeAdmin;
    private isDevelopment;
}
