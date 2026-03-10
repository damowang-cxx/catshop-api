import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { FastifyRequest } from 'fastify';
import { MockDatabaseService } from '../../shared/mock-database.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly mockDb;
    private readonly jwtService;
    private readonly configService;
    constructor(mockDb: MockDatabaseService, jwtService: JwtService, configService: ConfigService);
    login(payload: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
        token: string;
    } | {
        user: {
            id: string;
            email: string;
            firstName: string | undefined;
            lastName: string | undefined;
            phone: string | undefined;
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
        };
        token: string;
    }>;
    getCurrentUser(request: FastifyRequest): {
        id: string;
        email: string;
        firstName: string | undefined;
        lastName: string | undefined;
        phone: string | undefined;
    } | {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    extractToken(request: FastifyRequest): string | undefined;
    private signToken;
    private toCustomerUser;
}
