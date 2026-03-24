export declare class CreateAdminUserDto {
    email: string;
    name: string;
    password: string;
    roleId: string;
    status?: 'ACTIVE' | 'INVITED' | 'DISABLED';
}
