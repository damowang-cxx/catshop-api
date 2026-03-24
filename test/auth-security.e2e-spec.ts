import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createTestApp } from './support/create-test-app';
import {
  applyDevelopmentTestEnv,
  applyProductionTestEnv,
  restoreEnv,
  snapshotEnv,
} from './support/env';

describe('Auth security hardening (e2e)', () => {
  let app: NestFastifyApplication | null = null;
  let envSnapshot: NodeJS.ProcessEnv | null = null;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = null;
    }
    if (envSnapshot) {
      restoreEnv(envSnapshot);
      envSnapshot = null;
    }
  });

  it('rejects demo admin tokens in production', async () => {
    envSnapshot = snapshotEnv();
    applyProductionTestEnv();
    app = await createTestApp();

    await request(app.getHttpServer())
      .get('/api/stats')
      .set('Authorization', 'Bearer test_admin_token_prod_block')
      .expect(401);
  });

  it('allows seeded admin login with hashed passwords in production', async () => {
    envSnapshot = snapshotEnv();
    applyProductionTestEnv();
    app = await createTestApp();

    const response = await request(app.getHttpServer())
      .post('/api/admin/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      user: {
        email: 'admin@example.com',
        role: 'admin',
      },
    });
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('allows customer registration in production with persisted auth storage', async () => {
    envSnapshot = snapshotEnv();
    applyProductionTestEnv();
    app = await createTestApp();

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'new-user@example.com',
        password: 'supersecure123',
        firstName: 'New',
        lastName: 'User',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      user: {
        email: 'new-user@example.com',
        role: 'customer',
      },
    });
    expect(response.body).toHaveProperty('token');
  });

  it('rejects overly long passwords at the DTO layer', async () => {
    envSnapshot = snapshotEnv();
    applyDevelopmentTestEnv();
    app = await createTestApp();

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'too-long@example.com',
        password: 'x'.repeat(129),
        firstName: 'Too',
        lastName: 'Long',
      })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('password must be shorter than or equal to 128 characters'),
      ]),
    );
  });
});
