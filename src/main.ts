import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const configService = app.get(ConfigService);
  const appUrl = configService.get<string>('app.url') ?? 'http://localhost:3001';
  const port = configService.get<number>('app.port') ?? 3001;
  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api';
  const uploadsRoot = join(process.cwd(), 'storage', 'uploads');

  await app.register(cookie, {
    secret: configService.get<string>('app.cookieSecret') ?? 'catshop-cookie-secret',
  });
  await app.register(helmet);
  await app.register(rateLimit, {
    global: true,
    max: configService.get<number>('app.rateLimitMax') ?? 200,
    timeWindow: '1 minute',
    skipOnError: true,
  });
  await app.register(multipart, {
    limits: {
      fileSize: configService.get<number>('upload.maxFileSize') ?? 5 * 1024 * 1024,
      files: 5,
    },
  });
  await app.register(fastifyStatic, {
    root: uploadsRoot,
    prefix: '/uploads/',
  });

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CatShop API')
    .setDescription('Backend API for CatShop storefront and admin panel.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.listen(port, '0.0.0.0');

  app
    .getHttpAdapter()
    .getInstance()
    .log.info(`CatShop API listening on ${appUrl} with prefix /${apiPrefix}`);
}

bootstrap();
