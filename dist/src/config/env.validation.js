"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
function asPort(value, fallback) {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}
function ensureUrl(name, value, fallback) {
    const input = String(value ?? fallback);
    try {
        return new URL(input).toString().replace(/\/$/, '');
    }
    catch {
        throw new Error(`${name} must be a valid URL.`);
    }
}
function validateEnv(config) {
    return {
        NODE_ENV: String(config.NODE_ENV ?? 'development'),
        PORT: asPort(config.PORT, 3001),
        APP_URL: ensureUrl('APP_URL', config.APP_URL, 'http://localhost:3001'),
        API_PREFIX: String(config.API_PREFIX ?? 'api'),
        COOKIE_SECRET: String(config.COOKIE_SECRET ?? 'catshop-cookie-secret'),
        RATE_LIMIT_MAX: asPort(config.RATE_LIMIT_MAX, 200),
        JWT_SECRET: String(config.JWT_SECRET ?? 'catshop-dev-jwt-secret'),
        JWT_REFRESH_SECRET: String(config.JWT_REFRESH_SECRET ?? 'catshop-dev-refresh-secret'),
        DATABASE_URL: String(config.DATABASE_URL ??
            'postgresql://postgres:postgres@localhost:5432/catshop'),
        REDIS_URL: ensureUrl('REDIS_URL', config.REDIS_URL, 'redis://localhost:6379'),
        CLICKHOUSE_URL: ensureUrl('CLICKHOUSE_URL', config.CLICKHOUSE_URL, 'http://localhost:8123'),
        MEILISEARCH_URL: ensureUrl('MEILISEARCH_URL', config.MEILISEARCH_URL, 'http://localhost:7700'),
        S3_ENDPOINT: ensureUrl('S3_ENDPOINT', config.S3_ENDPOINT, 'http://localhost:9000'),
        S3_REGION: String(config.S3_REGION ?? 'us-east-1'),
        S3_BUCKET: String(config.S3_BUCKET ?? 'catshop-assets'),
        S3_ACCESS_KEY_ID: String(config.S3_ACCESS_KEY_ID ?? 'minioadmin'),
        S3_SECRET_ACCESS_KEY: String(config.S3_SECRET_ACCESS_KEY ?? 'minioadmin'),
        UPLOAD_MAX_FILE_SIZE: asPort(config.UPLOAD_MAX_FILE_SIZE, 5 * 1024 * 1024),
        UPLOAD_ALLOWED_MIME_TYPES: String(config.UPLOAD_ALLOWED_MIME_TYPES ??
            'image/jpeg,image/png,image/webp,image/avif'),
        ADMIN_EMAIL: String(config.ADMIN_EMAIL ?? 'admin@example.com'),
        ADMIN_PASSWORD: String(config.ADMIN_PASSWORD ?? 'admin123'),
        ADMIN_DEMO_TOKEN: String(config.ADMIN_DEMO_TOKEN ?? 'test_admin_token'),
    };
}
//# sourceMappingURL=env.validation.js.map