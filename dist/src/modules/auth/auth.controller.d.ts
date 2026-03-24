import type { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { GoogleAuthorizeQueryDto, GoogleCallbackDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    googleUrl(query: GoogleAuthorizeQueryDto): {
        url: string;
    };
    googleCallback(payload: GoogleCallbackDto): Promise<{
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
    logout(): {
        success: boolean;
    };
    me(request: FastifyRequest): Promise<{
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
}
