import { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createTestApp } from './support/create-test-app';
import {
  applyDevelopmentTestEnv,
  restoreEnv,
  snapshotEnv,
} from './support/env';

describe('Catalog admin route protection (e2e)', () => {
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

  it('keeps paginated public products limited to active records', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products?page=1&pageSize=20')
      .expect(200);

    expect(response.body).toMatchObject({
      page: 1,
      pageSize: 20,
    });
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBeGreaterThan(0);
    expect(
      response.body.items.every(
        (product: { handle?: string }) => product.handle !== 'sleepy-kitty-plush',
      ),
    ).toBe(true);
  });

  it('rejects anonymous access to admin product list', () => {
    return request(app.getHttpServer())
      .get('/api/admin/products?page=1&pageSize=20')
      .expect(401);
  });

  it('allows admin access to admin product list with a token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/admin/products?page=1&pageSize=20')
      .set('Authorization', 'Bearer test_admin_token_security')
      .expect(200);

    expect(response.body).toMatchObject({
      page: 1,
      pageSize: 20,
    });
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(
      response.body.items.some((product: { status?: string }) => product.status === 'draft'),
    ).toBe(true);
  });
});
