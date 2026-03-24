import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthService } from './auth.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
export declare class AdminUsersController {
    private readonly authService;
    constructor(authService: AuthService);
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
    createAdminUser(payload: CreateAdminUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: "admin";
        adminRole: string;
        permissions: string[];
        lastLoginAt: string | undefined;
    }>;
    updateAdminUser(id: string, payload: UpdateAdminUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: "admin";
        adminRole: string;
        permissions: string[];
        lastLoginAt: string | undefined;
    }>;
}
