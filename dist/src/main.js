"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const swagger_1 = require("@nestjs/swagger");
const cookie_1 = __importDefault(require("@fastify/cookie"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const static_1 = __importDefault(require("@fastify/static"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({ logger: true }));
    const configService = app.get(config_1.ConfigService);
    const appUrl = configService.get('app.url') ?? 'http://127.0.0.1:3001';
    const port = configService.get('app.port') ?? 3001;
    const apiPrefix = configService.get('app.apiPrefix') ?? 'api';
    const uploadsRoot = (0, node_path_1.join)(process.cwd(), 'storage', 'uploads');
    await app.register(cookie_1.default, {
        secret: configService.get('app.cookieSecret') ?? 'catshop-cookie-secret',
    });
    await app.register(helmet_1.default);
    await app.register(rate_limit_1.default, {
        global: true,
        max: configService.get('app.rateLimitMax') ?? 200,
        timeWindow: '1 minute',
        skipOnError: true,
    });
    await app.register(multipart_1.default, {
        limits: {
            fileSize: configService.get('upload.maxFileSize') ?? 5 * 1024 * 1024,
            files: 5,
        },
    });
    await app.register(static_1.default, {
        root: uploadsRoot,
        prefix: '/uploads/',
    });
    app.setGlobalPrefix(apiPrefix);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('CatShop API')
        .setDescription('Backend API for CatShop storefront and admin panel.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
    await app.listen(port, '0.0.0.0');
    app
        .getHttpAdapter()
        .getInstance()
        .log.info(`CatShop API listening on ${appUrl} with prefix /${apiPrefix}`);
}
bootstrap();
//# sourceMappingURL=main.js.map