export declare const appConfig: (() => {
    nodeEnv: string;
    port: number;
    url: string;
    apiPrefix: string;
    cookieSecret: string;
    rateLimitMax: number;
    jwtSecret: string;
    jwtRefreshSecret: string;
    adminEmail: string;
    adminPasswordHash: string;
    customerEmail: string;
    customerPasswordHash: string;
    adminDemoToken: string;
    googleAuthEnabled: boolean;
    googleClientId: string;
    googleClientSecret: string;
    googleRedirectUri: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    url: string;
    apiPrefix: string;
    cookieSecret: string;
    rateLimitMax: number;
    jwtSecret: string;
    jwtRefreshSecret: string;
    adminEmail: string;
    adminPasswordHash: string;
    customerEmail: string;
    customerPasswordHash: string;
    adminDemoToken: string;
    googleAuthEnabled: boolean;
    googleClientId: string;
    googleClientSecret: string;
    googleRedirectUri: string;
}>;
export declare const databaseConfig: (() => {
    url: string;
    redisUrl: string;
    clickhouseUrl: string;
    meilisearchUrl: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string;
    redisUrl: string;
    clickhouseUrl: string;
    meilisearchUrl: string;
}>;
export declare const storageConfig: (() => {
    endpoint: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    endpoint: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
}>;
export declare const uploadConfig: (() => {
    maxFileSize: number;
    allowedMimeTypes: string[];
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    maxFileSize: number;
    allowedMimeTypes: string[];
}>;
