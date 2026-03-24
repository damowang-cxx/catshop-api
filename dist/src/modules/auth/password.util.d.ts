import * as argon2 from 'argon2';
export declare const PASSWORD_MIN_LENGTH = 8;
export declare const PASSWORD_MAX_LENGTH = 128;
export declare const PASSWORD_HASH_OPTIONS: argon2.Options & {
    raw?: false;
};
export declare const DEV_ADMIN_PASSWORD_HASH = "$argon2id$v=19$m=19456,t=2,p=1$5msT9CblrNrv7razUCSHvg$9fJcm9kEWSOl/dtIoagTV9o9GU7do3QkcaTgw+4PlTg";
export declare const DEV_CUSTOMER_PASSWORD_HASH = "$argon2id$v=19$m=19456,t=2,p=1$Bh4xCTD/UFX8zOYBLGFzRQ$kncUvnvrxHS029pbkfEEeq0FIhPQ1UeC1d7Z/2V0poA";
export declare function isArgon2Hash(value?: string | null): value is string;
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(passwordHash: string, password: string): Promise<boolean>;
