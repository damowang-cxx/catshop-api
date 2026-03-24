import {
  DEV_ADMIN_PASSWORD_HASH,
  DEV_CUSTOMER_PASSWORD_HASH,
  isArgon2Hash,
} from '../modules/auth/password.util';

type EnvRecord = Record<string, unknown>;

const DEFAULT_COOKIE_SECRET = 'catshop-cookie-secret';
const DEFAULT_JWT_SECRET = 'catshop-dev-jwt-secret';
const DEFAULT_JWT_REFRESH_SECRET = 'catshop-dev-refresh-secret';
const DEFAULT_ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_CUSTOMER_EMAIL = 'alice@example.com';

function asPort(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return String(value).toLowerCase() === 'true';
}

function ensureUrl(name: string, value: unknown, fallback: string): string {
  const input = String(value ?? fallback);

  try {
    return new URL(input).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }
}

function ensureNonEmpty(name: string, value: string) {
  if (!value.trim()) {
    throw new Error(`${name} must not be empty.`);
  }
}

function ensureProductionValue(
  name: string,
  value: string,
  disallowed: string[],
) {
  ensureNonEmpty(name, value);

  if (disallowed.includes(value)) {
    throw new Error(`${name} must be explicitly configured in production.`);
  }
}

export function validateEnv(config: EnvRecord) {
  const nodeEnv = String(config.NODE_ENV ?? 'development');
  const isProduction = nodeEnv === 'production';
  const adminDemoToken = isProduction
    ? String(config.ADMIN_DEMO_TOKEN ?? '')
    : String(config.ADMIN_DEMO_TOKEN ?? 'test_admin_token');

  const validated = {
    NODE_ENV: nodeEnv,
    PORT: asPort(config.PORT, 3001),
    APP_URL: ensureUrl('APP_URL', config.APP_URL, 'http://127.0.0.1:3001'),
    API_PREFIX: String(config.API_PREFIX ?? 'api'),
    COOKIE_SECRET: String(config.COOKIE_SECRET ?? DEFAULT_COOKIE_SECRET),
    RATE_LIMIT_MAX: asPort(config.RATE_LIMIT_MAX, 200),
    JWT_SECRET: String(config.JWT_SECRET ?? DEFAULT_JWT_SECRET),
    JWT_REFRESH_SECRET: String(
      config.JWT_REFRESH_SECRET ?? DEFAULT_JWT_REFRESH_SECRET,
    ),
    DATABASE_URL: String(
      config.DATABASE_URL ??
        'postgresql://postgres:postgres@localhost:5432/catshop',
    ),
    REDIS_URL: ensureUrl('REDIS_URL', config.REDIS_URL, 'redis://localhost:6379'),
    CLICKHOUSE_URL: ensureUrl(
      'CLICKHOUSE_URL',
      config.CLICKHOUSE_URL,
      'http://localhost:8123',
    ),
    MEILISEARCH_URL: ensureUrl(
      'MEILISEARCH_URL',
      config.MEILISEARCH_URL,
      'http://localhost:7700',
    ),
    S3_ENDPOINT: ensureUrl(
      'S3_ENDPOINT',
      config.S3_ENDPOINT,
      'http://localhost:9000',
    ),
    S3_REGION: String(config.S3_REGION ?? 'us-east-1'),
    S3_BUCKET: String(config.S3_BUCKET ?? 'catshop-assets'),
    S3_ACCESS_KEY_ID: String(config.S3_ACCESS_KEY_ID ?? 'minioadmin'),
    S3_SECRET_ACCESS_KEY: String(config.S3_SECRET_ACCESS_KEY ?? 'minioadmin'),
    UPLOAD_MAX_FILE_SIZE: asPort(config.UPLOAD_MAX_FILE_SIZE, 5 * 1024 * 1024),
    UPLOAD_ALLOWED_MIME_TYPES: String(
      config.UPLOAD_ALLOWED_MIME_TYPES ??
        'image/jpeg,image/png,image/webp,image/avif',
    ),
    ADMIN_EMAIL: String(config.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL),
    ADMIN_PASSWORD_HASH: String(
      config.ADMIN_PASSWORD_HASH ?? DEV_ADMIN_PASSWORD_HASH,
    ),
    CUSTOMER_EMAIL: String(config.CUSTOMER_EMAIL ?? DEFAULT_CUSTOMER_EMAIL),
    CUSTOMER_PASSWORD_HASH: String(
      config.CUSTOMER_PASSWORD_HASH ?? DEV_CUSTOMER_PASSWORD_HASH,
    ),
    ADMIN_DEMO_TOKEN: adminDemoToken,
    GOOGLE_AUTH_ENABLED: asBoolean(config.GOOGLE_AUTH_ENABLED, false),
    GOOGLE_CLIENT_ID: String(config.GOOGLE_CLIENT_ID ?? ''),
    GOOGLE_CLIENT_SECRET: String(config.GOOGLE_CLIENT_SECRET ?? ''),
    GOOGLE_REDIRECT_URI: String(config.GOOGLE_REDIRECT_URI ?? ''),
  };

  if (isProduction) {
    ensureProductionValue('COOKIE_SECRET', validated.COOKIE_SECRET, [
      DEFAULT_COOKIE_SECRET,
    ]);
    ensureProductionValue('JWT_SECRET', validated.JWT_SECRET, [
      DEFAULT_JWT_SECRET,
    ]);
    ensureProductionValue('JWT_REFRESH_SECRET', validated.JWT_REFRESH_SECRET, [
      DEFAULT_JWT_REFRESH_SECRET,
    ]);
    ensureProductionValue('ADMIN_PASSWORD_HASH', validated.ADMIN_PASSWORD_HASH, [
      DEV_ADMIN_PASSWORD_HASH,
    ]);
    ensureProductionValue(
      'CUSTOMER_PASSWORD_HASH',
      validated.CUSTOMER_PASSWORD_HASH,
      [DEV_CUSTOMER_PASSWORD_HASH],
    );

    if (!isArgon2Hash(validated.ADMIN_PASSWORD_HASH)) {
      throw new Error('ADMIN_PASSWORD_HASH must be a valid Argon2id hash.');
    }

    if (!isArgon2Hash(validated.CUSTOMER_PASSWORD_HASH)) {
      throw new Error('CUSTOMER_PASSWORD_HASH must be a valid Argon2id hash.');
    }

    if (validated.ADMIN_DEMO_TOKEN.trim()) {
      throw new Error('ADMIN_DEMO_TOKEN is only allowed in development.');
    }

    if (String(config.ADMIN_PASSWORD ?? '').trim()) {
      throw new Error(
        'ADMIN_PASSWORD is deprecated and must not be used in production.',
      );
    }
  }

  if (validated.GOOGLE_AUTH_ENABLED) {
    ensureNonEmpty('GOOGLE_CLIENT_ID', validated.GOOGLE_CLIENT_ID);
    ensureNonEmpty('GOOGLE_CLIENT_SECRET', validated.GOOGLE_CLIENT_SECRET);
    ensureNonEmpty('GOOGLE_REDIRECT_URI', validated.GOOGLE_REDIRECT_URI);
    validated.GOOGLE_REDIRECT_URI = ensureUrl(
      'GOOGLE_REDIRECT_URI',
      validated.GOOGLE_REDIRECT_URI,
      validated.GOOGLE_REDIRECT_URI,
    );
  }

  return validated;
}

