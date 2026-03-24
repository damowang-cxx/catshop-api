import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AdminUserStatus } from '@prisma/client';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { GoogleCallbackDto, GoogleAuthorizeQueryDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(payload: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string | undefined;
            lastName: string | undefined;
            phone: string | undefined;
            avatarUrl: string | undefined;
            authProvider: string;
            role: "customer";
            lastLoginAt: string | undefined;
        };
        token: string;
    }>;
    loginAdmin(payload: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: "admin";
            adminRole: string;
            permissions: string[];
            lastLoginAt: string | undefined;
        };
        token: string;
    }>;
    register(payload: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string | undefined;
            lastName: string | undefined;
            phone: string | undefined;
            avatarUrl: string | undefined;
            authProvider: string;
            role: "customer";
            lastLoginAt: string | undefined;
        };
        token: string;
    }>;
    getGoogleAuthorizationUrl(query: GoogleAuthorizeQueryDto): {
        url: string;
    };
    authenticateWithGoogle(payload: GoogleCallbackDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string | undefined;
            lastName: string | undefined;
            phone: string | undefined;
            avatarUrl: string | undefined;
            authProvider: string;
            role: "customer";
            lastLoginAt: string | undefined;
        };
        token: string;
    }>;
    getCurrentUser(request: FastifyRequest): Promise<{
        id: string;
        email: string;
        firstName: string | undefined;
        lastName: string | undefined;
        phone: string | undefined;
        avatarUrl: string | undefined;
        authProvider: string;
        role: "customer";
        lastLoginAt: string | undefined;
    }>;
    tryGetCurrentCustomer(request: FastifyRequest): Promise<{
        id: string;
        email: string;
        status: import("@prisma/client").$Enums.UserStatus;
    } | null>;
    getCurrentAdmin(request: FastifyRequest): Promise<{
        id: string;
        email: string;
        name: string;
        role: "admin";
        adminRole: string;
        permissions: string[];
        lastLoginAt: string | undefined;
    }>;
    listRoles(): Promise<{
        id: string;
        key: string;
        name: string;
        description: string | null;
        permissions: {
            key: string;
            name: string;
        }[];
    }[]>;
    listAdminUsers(query: PaginationQueryDto): Promise<{
        items: {
            id: string;
            email: string;
            name: string;
            role: "admin";
            adminRole: string;
            permissions: string[];
            lastLoginAt: string | undefined;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    createAdminUser(payload: {
        email: string;
        name: string;
        password: string;
        roleId: string;
        status?: AdminUserStatus;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: "admin";
        adminRole: string;
        permissions: string[];
        lastLoginAt: string | undefined;
    }>;
    updateAdminUser(id: string, payload: {
        name?: string;
        password?: string;
        roleId?: string;
        status?: AdminUserStatus;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: "admin";
        adminRole: string;
        permissions: string[];
        lastLoginAt: string | undefined;
    }>;
    private extractCustomerToken;
    private extractAdminToken;
    private extractToken;
    private isDevelopment;
    private isGoogleAuthEnabled;
    private getGoogleClientId;
    private getGoogleClientSecret;
    private getGoogleRedirectUri;
    private signToken;
    private verifyAuthToken;
    private exchangeGoogleCode;
    private parseGoogleIdToken;
    private validateGoogleClaims;
    private findOrCreateGoogleCustomer;
    private toAdminUser;
    private toCustomerUser;
}
