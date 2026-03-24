import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createTestApp } from './support/create-test-app';
import {
  applyDevelopmentTestEnv,
  restoreEnv,
  snapshotEnv,
} from './support/env';

describe('Admin me endpoint (e2e)', () => {
  let app: NestFastifyApplication;
  let envSnapshot: NodeJS.ProcessEnv;

  beforeEach(async () => {
    envSnapshot = snapshotEnv();
    applyDevelopmentTestEnv();
    app = await createTestApp();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    restoreEnv(envSnapshot);
  });

  it('rejects anonymous access to /api/admin/me', () => {
    return request(app.getHttpServer()).get('/api/admin/me').expect(401);
  });

  it('rejects forged admin tokens', () => {
    return request(app.getHttpServer())
      .get('/api/admin/me')
      .set('Authorization', 'Bearer forged-admin-token')
      .expect(401);
  });

  it('returns normalized admin identity for a valid admin token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/admin/me')
      .set('Authorization', 'Bearer test_admin_token_identity')
      .expect(200);

    expect(response.body).toMatchObject({
      email: 'admin@example.com',
      role: 'admin',
      adminRole: 'super_admin',
    });
  });
});
