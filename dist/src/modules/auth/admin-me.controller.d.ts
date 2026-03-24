import type { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AdminMeController {
    private readonly authService;
    constructor(authService: AuthService);
    login(payload: LoginDto): Promise<{
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
    me(request: FastifyRequest): Promise<{
        id: string;
        email: string;
        name: string;
        role: "admin";
        adminRole: string;
        permissions: string[];
        lastLoginAt: string | undefined;
    }>;
}
