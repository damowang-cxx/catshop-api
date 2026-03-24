import * as argon2 from 'argon2';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_HASH_OPTIONS: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export const DEV_ADMIN_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$5msT9CblrNrv7razUCSHvg$9fJcm9kEWSOl/dtIoagTV9o9GU7do3QkcaTgw+4PlTg';
export const DEV_CUSTOMER_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$Bh4xCTD/UFX8zOYBLGFzRQ$kncUvnvrxHS029pbkfEEeq0FIhPQ1UeC1d7Z/2V0poA';

export function isArgon2Hash(value?: string | null): value is string {
  return typeof value === 'string' && value.startsWith('$argon2id$');
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, PASSWORD_HASH_OPTIONS);
}

export async function verifyPassword(
  passwordHash: string,
  password: string,
): Promise<boolean> {
  if (!isArgon2Hash(passwordHash)) {
    return false;
  }

  return argon2.verify(passwordHash, password);
}
