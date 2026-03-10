import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '3001', 10),
  url: process.env.APP_URL ?? 'http://localhost:3001',
  apiPrefix: process.env.API_PREFIX ?? 'api',
  cookieSecret: process.env.COOKIE_SECRET ?? 'catshop-cookie-secret',
  rateLimitMax: Number.parseInt(process.env.RATE_LIMIT_MAX ?? '200', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'catshop-dev-jwt-secret',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? 'catshop-dev-refresh-secret',
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@example.com',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
  adminDemoToken: process.env.ADMIN_DEMO_TOKEN ?? 'test_admin_token',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/catshop',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  clickhouseUrl: process.env.CLICKHOUSE_URL ?? 'http://localhost:8123',
  meilisearchUrl: process.env.MEILISEARCH_URL ?? 'http://localhost:7700',
}));

export const storageConfig = registerAs('storage', () => ({
  endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
  region: process.env.S3_REGION ?? 'us-east-1',
  bucket: process.env.S3_BUCKET ?? 'catshop-assets',
  accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'minioadmin',
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'minioadmin',
}));

export const uploadConfig = registerAs('upload', () => ({
  maxFileSize: Number.parseInt(process.env.UPLOAD_MAX_FILE_SIZE ?? `${5 * 1024 * 1024}`, 10),
  allowedMimeTypes: (process.env.UPLOAD_ALLOWED_MIME_TYPES ??
    'image/jpeg,image/png,image/webp,image/avif').split(','),
}));
