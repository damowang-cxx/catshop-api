import {
  DEV_ADMIN_PASSWORD_HASH,
  DEV_CUSTOMER_PASSWORD_HASH,
} from '../modules/auth/password.util';
import { validateEnv } from './env.validation';

function createProductionEnv(overrides: Record<string, unknown> = {}) {
  return {
    NODE_ENV: 'production',
    PORT: 3001,
    APP_URL: 'http://127.0.0.1:3001',
    API_PREFIX: 'api',
    COOKIE_SECRET: 'prod-cookie-secret-1234567890',
    RATE_LIMIT_MAX: 200,
    JWT_SECRET: 'prod-jwt-secret-1234567890',
    JWT_REFRESH_SECRET: 'prod-refresh-secret-1234567890',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/catshop',
    REDIS_URL: 'redis://localhost:6379',
    CLICKHOUSE_URL: 'http://localhost:8123',
    MEILISEARCH_URL: 'http://localhost:7700',
    S3_ENDPOINT: 'http://localhost:9000',
    S3_REGION: 'us-east-1',
    S3_BUCKET: 'catshop-assets',
    S3_ACCESS_KEY_ID: 'minioadmin',
    S3_SECRET_ACCESS_KEY: 'minioadmin',
    UPLOAD_MAX_FILE_SIZE: 5 * 1024 * 1024,
    UPLOAD_ALLOWED_MIME_TYPES: 'image/jpeg,image/png',
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PASSWORD_HASH:
      '$argon2id$v=19$m=19456,t=2,p=1$kZX/Kwc2qk0XsG78NVo//w$7Myiay8Xkj3q91sczcgAlHSUQvEQRkduXu0fB/g5SWQ',
    CUSTOMER_EMAIL: 'alice@example.com',
    CUSTOMER_PASSWORD_HASH:
      '$argon2id$v=19$m=19456,t=2,p=1$PHM0dxG545igYf7iW0rkxw$GTOYlHT7wgO8bYlapKbHW0jxN4WS7ts8AD2HnlZPvfs',
    ADMIN_DEMO_TOKEN: '',
    ADMIN_PASSWORD: '',
    ...overrides,
  };
}

describe('validateEnv', () => {
  it('rejects default JWT secrets in production', () => {
    expect(() =>
      validateEnv(
        createProductionEnv({
          JWT_SECRET: 'catshop-dev-jwt-secret',
        }),
      ),
    ).toThrow('JWT_SECRET must be explicitly configured in production.');
  });

  it('rejects default cookie secrets in production', () => {
    expect(() =>
      validateEnv(
        createProductionEnv({
          COOKIE_SECRET: 'catshop-cookie-secret',
        }),
      ),
    ).toThrow('COOKIE_SECRET must be explicitly configured in production.');
  });

  it('rejects default mock hashes in production', () => {
    expect(() =>
      validateEnv(
        createProductionEnv({
          ADMIN_PASSWORD_HASH: DEV_ADMIN_PASSWORD_HASH,
          CUSTOMER_PASSWORD_HASH: DEV_CUSTOMER_PASSWORD_HASH,
        }),
      ),
    ).toThrow('ADMIN_PASSWORD_HASH must be explicitly configured in production.');
  });

  it('rejects demo tokens in production', () => {
    expect(() =>
      validateEnv(
        createProductionEnv({
          ADMIN_DEMO_TOKEN: 'test_admin_token',
        }),
      ),
    ).toThrow('ADMIN_DEMO_TOKEN is only allowed in development.');
  });

  it('rejects deprecated ADMIN_PASSWORD in production', () => {
    expect(() =>
      validateEnv(
        createProductionEnv({
          ADMIN_PASSWORD: 'admin123',
        }),
      ),
    ).toThrow('ADMIN_PASSWORD is deprecated and must not be used in production.');
  });

  it('requires Google OAuth secrets when Google auth is enabled', () => {
    expect(() =>
      validateEnv(
        createProductionEnv({
          GOOGLE_AUTH_ENABLED: true,
          GOOGLE_CLIENT_ID: '',
        }),
      ),
    ).toThrow('GOOGLE_CLIENT_ID must not be empty.');
  });
});

