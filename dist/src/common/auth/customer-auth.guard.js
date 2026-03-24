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
exports.CustomerAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
let CustomerAuthGuard = class CustomerAuthGuard {
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
            throw new common_1.UnauthorizedException('Authentication token is required.');
        }
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('app.jwtSecret'),
            });
            if (payload.role !== 'customer') {
                throw new common_1.UnauthorizedException('Customer role is required.');
            }
            const customer = await this.prisma.customer.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    status: true,
                },
            });
            if (!customer || customer.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('Customer account is unavailable.');
            }
            request.customer = {
                id: customer.id,
                email: customer.email,
            };
            return true;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Invalid authentication token.');
        }
    }
    extractToken(request) {
        const authorization = request.headers.authorization;
        if (authorization?.startsWith('Bearer ')) {
            return authorization.slice(7);
        }
        return request.cookies?.auth_token;
    }
};
exports.CustomerAuthGuard = CustomerAuthGuard;
exports.CustomerAuthGuard = CustomerAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], CustomerAuthGuard);
//# sourceMappingURL=customer-auth.guard.js.map