import type { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    logout(): {
        success: boolean;
    };
    me(request: FastifyRequest): {
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
}
