export declare class UpdateAdminUserDto {
    name?: string;
    password?: string;
    roleId?: string;
    status?: 'ACTIVE' | 'INVITED' | 'DISABLED';
}
