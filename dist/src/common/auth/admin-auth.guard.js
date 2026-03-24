"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminAuthGuard = class AdminAuthGuard {
    configService;
    jwtService;
    prisma;
    constructor(configService, jwtService, prisma) {
        this.configService = configService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Admin token is required.');
        }
        const admin = await this.resolveAdminFromToken(token);
        request.admin = admin;
        return true;
    }
    extractToken(request) {
        const authHeader = request.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ')
            ? authHeader.slice(7)
            : undefined;
        const cookieToken = request.cookies?.admin_token;
        return bearerToken ?? cookieToken;
    }
    async resolveAdminFromToken(token) {
        const demoToken = this.configService.get('app.adminDemoToken');
        if (this.isDevelopment() &&
            ((demoToken && token === demoToken) || token.startsWith('test_admin_token_'))) {
            const demoAdmin = await this.prisma.adminUser.findFirst({
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });
            if (!demoAdmin) {
                throw new common_1.UnauthorizedException('Admin not found.');
            }
            return this.serializeAdmin(demoAdmin);
        }
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('app.jwtSecret'),
            });
            if (payload.role !== 'admin') {
                throw new common_1.UnauthorizedException('Admin role is required.');
            }
            const admin = await this.prisma.adminUser.findUnique({
                where: { id: payload.sub },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!admin || admin.status === 'DISABLED') {
                throw new common_1.UnauthorizedException('Admin account is unavailable.');
            }
            return this.serializeAdmin(admin);
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Invalid admin token.');
        }
    }
    serializeAdmin(admin) {
        return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            adminRole: admin.role.key,
            permissions: admin.role.permissions.map(({ permission }) => permission.key),
        };
    }
    isDevelopment() {
        return this.configService.get('app.nodeEnv') === 'development';
    }
};
exports.AdminAuthGuard = AdminAuthGuard;
exports.AdminAuthGuard = AdminAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AdminAuthGuard);
//# sourceMappingURL=admin-auth.guard.js.map