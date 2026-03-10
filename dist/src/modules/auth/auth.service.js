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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const mock_database_service_1 = require("../../shared/mock-database.service");
let AuthService = class AuthService {
    mockDb;
    jwtService;
    configService;
    constructor(mockDb, jwtService, configService) {
        this.mockDb = mockDb;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(payload) {
        const admin = this.mockDb.admins.find((candidate) => candidate.email.toLowerCase() === payload.email.toLowerCase() &&
            candidate.password === payload.password);
        if (admin) {
            return {
                user: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    role: admin.role,
                },
                token: await this.signToken(admin.id, admin.email, 'admin'),
            };
        }
        const customer = this.mockDb.customers.find((candidate) => candidate.email.toLowerCase() === payload.email.toLowerCase() &&
            candidate.password === payload.password);
        if (!customer) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        customer.lastLoginAt = new Date().toISOString();
        return {
            user: this.toCustomerUser(customer),
            token: await this.signToken(customer.id, customer.email, 'customer'),
        };
    }
    async register(payload) {
        const exists = this.mockDb.customers.some((customer) => customer.email.toLowerCase() === payload.email.toLowerCase());
        if (exists) {
            throw new common_1.ConflictException('Email already exists.');
        }
        const customer = {
            id: this.mockDb.createId('cus'),
            email: payload.email,
            password: payload.password,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            status: 'active',
            lastLoginAt: new Date().toISOString(),
        };
        this.mockDb.customers.push(customer);
        return {
            user: this.toCustomerUser(customer),
            token: await this.signToken(customer.id, customer.email, 'customer'),
        };
    }
    getCurrentUser(request) {
        const token = this.extractToken(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Authentication token is required.');
        }
        const payload = this.jwtService.verify(token, {
            secret: this.configService.get('app.jwtSecret'),
        });
        if (payload.role === 'admin') {
            const admin = this.mockDb.admins.find((candidate) => candidate.id === payload.sub);
            if (!admin) {
                throw new common_1.UnauthorizedException('Admin not found.');
            }
            return {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
            };
        }
        const customer = this.mockDb.customers.find((candidate) => candidate.id === payload.sub);
        if (!customer) {
            throw new common_1.UnauthorizedException('Customer not found.');
        }
        return this.toCustomerUser(customer);
    }
    extractToken(request) {
        const cookies = request.cookies;
        const authorization = request.headers.authorization;
        if (authorization?.startsWith('Bearer ')) {
            return authorization.slice(7);
        }
        return cookies?.auth_token ?? cookies?.admin_token;
    }
    async signToken(sub, email, role) {
        return this.jwtService.signAsync({ sub, email, role }, {
            secret: this.configService.get('app.jwtSecret'),
            expiresIn: '7d',
        });
    }
    toCustomerUser(customer) {
        return {
            id: customer.id,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_database_service_1.MockDatabaseService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map