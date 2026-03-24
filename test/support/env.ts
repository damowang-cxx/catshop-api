import {
  DEV_ADMIN_PASSWORD_HASH,
  DEV_CUSTOMER_PASSWORD_HASH,
} from '../../src/modules/auth/password.util';

export function snapshotEnv() {
  return { ...process.env };
}

export function restoreEnv(snapshot: NodeJS.ProcessEnv) {
  process.env = snapshot;
}

export function applyDevelopmentTestEnv() {
  process.env.NODE_ENV = 'development';
  process.env.JWT_SECRET = 'catshop-dev-jwt-secret';
  process.env.JWT_REFRESH_SECRET = 'catshop-dev-refresh-secret';
  process.env.COOKIE_SECRET = 'catshop-cookie-secret';
  process.env.ADMIN_EMAIL = 'admin@example.com';
  process.env.ADMIN_PASSWORD_HASH = DEV_ADMIN_PASSWORD_HASH;
  process.env.CUSTOMER_EMAIL = 'alice@example.com';
  process.env.CUSTOMER_PASSWORD_HASH = DEV_CUSTOMER_PASSWORD_HASH;
  process.env.ADMIN_DEMO_TOKEN = 'test_admin_token';
  process.env.ADMIN_PASSWORD = '';
}

export function applyProductionTestEnv() {
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = 'prod-jwt-secret-1234567890';
  process.env.JWT_REFRESH_SECRET = 'prod-refresh-secret-1234567890';
  process.env.COOKIE_SECRET = 'prod-cookie-secret-1234567890';
  process.env.ADMIN_EMAIL = 'admin@example.com';
  process.env.ADMIN_PASSWORD_HASH =
    '$argon2id$v=19$m=19456,t=2,p=1$kZX/Kwc2qk0XsG78NVo//w$7Myiay8Xkj3q91sczcgAlHSUQvEQRkduXu0fB/g5SWQ';
  process.env.CUSTOMER_EMAIL = 'alice@example.com';
  process.env.CUSTOMER_PASSWORD_HASH =
    '$argon2id$v=19$m=19456,t=2,p=1$PHM0dxG545igYf7iW0rkxw$GTOYlHT7wgO8bYlapKbHW0jxN4WS7ts8AD2HnlZPvfs';
  process.env.ADMIN_DEMO_TOKEN = '';
  process.env.ADMIN_PASSWORD = '';
}
