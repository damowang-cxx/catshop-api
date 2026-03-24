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
const node_crypto_1 = require("node:crypto");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const password_util_1 = require("./password.util");
const adminUserInclude = {
    role: {
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
        },
    },
};
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(payload) {
        const customer = await this.prisma.customer.findFirst({
            where: {
                email: {
                    equals: payload.email,
                    mode: 'insensitive',
                },
            },
        });
        if (!customer || !(await (0, password_util_1.verifyPassword)(customer.passwordHash, payload.password))) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        if (customer.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Customer account is unavailable.');
        }
        const updatedCustomer = await this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                lastLoginAt: new Date(),
            },
        });
        return {
            user: this.toCustomerUser(updatedCustomer),
            token: await this.signToken(updatedCustomer.id, updatedCustomer.email, 'customer'),
        };
    }
    async loginAdmin(payload) {
        const admin = await this.prisma.adminUser.findFirst({
            where: {
                email: {
                    equals: payload.email,
                    mode: 'insensitive',
                },
            },
            include: adminUserInclude,
        });
        if (!admin || !(await (0, password_util_1.verifyPassword)(admin.passwordHash, payload.password))) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        if (admin.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Admin account is unavailable.');
        }
        const updatedAdmin = await this.prisma.adminUser.update({
            where: { id: admin.id },
            data: {
                lastLoginAt: new Date(),
            },
            include: adminUserInclude,
        });
        return {
            user: this.toAdminUser(updatedAdmin),
            token: await this.signToken(updatedAdmin.id, updatedAdmin.email, 'admin'),
        };
    }
    async register(payload) {
        const exists = await this.prisma.customer.findFirst({
            where: {
                email: {
                    equals: payload.email,
                    mode: 'insensitive',
                },
            },
            select: { id: true },
        });
        if (exists) {
            throw new common_1.ConflictException('Email already exists.');
        }
        const customer = await this.prisma.customer.create({
            data: {
                email: payload.email.trim().toLowerCase(),
                passwordHash: await (0, password_util_1.hashPassword)(payload.password),
                firstName: payload.firstName,
                lastName: payload.lastName,
                phone: payload.phone,
                lastLoginAt: new Date(),
            },
        });
        return {
            user: this.toCustomerUser(customer),
            token: await this.signToken(customer.id, customer.email, 'customer'),
        };
    }
    getGoogleAuthorizationUrl(query) {
        if (!this.isGoogleAuthEnabled()) {
            throw new common_1.NotFoundException('Google sign-in is not enabled.');
        }
        const params = new URLSearchParams({
            client_id: this.getGoogleClientId(),
            redirect_uri: this.getGoogleRedirectUri(),
            response_type: 'code',
            scope: 'openid email profile',
            state: query.state,
            nonce: query.nonce,
            prompt: 'select_account',
        });
        return {
            url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
        };
    }
    async authenticateWithGoogle(payload) {
        if (!this.isGoogleAuthEnabled()) {
            throw new common_1.NotFoundException('Google sign-in is not enabled.');
        }
        const tokenResponse = await this.exchangeGoogleCode(payload.code);
        const claims = this.parseGoogleIdToken(tokenResponse.id_token);
        this.validateGoogleClaims(claims, payload.nonce);
        const customer = await this.findOrCreateGoogleCustomer(claims);
        return {
            user: this.toCustomerUser(customer),
            token: await this.signToken(customer.id, customer.email, 'customer'),
        };
    }
    async getCurrentUser(request) {
        const token = this.extractCustomerToken(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Authentication token is required.');
        }
        const payload = this.verifyAuthToken(token);
        if (payload.role !== 'customer') {
            throw new common_1.UnauthorizedException('Customer role is required.');
        }
        const customer = await this.prisma.customer.findUnique({
            where: { id: payload.sub },
        });
        if (!customer || customer.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Customer not found.');
        }
        return this.toCustomerUser(customer);
    }
    async tryGetCurrentCustomer(request) {
        const token = this.extractCustomerToken(request);
        if (!token) {
            return null;
        }
        try {
            const payload = this.verifyAuthToken(token);
            if (payload.role !== 'customer') {
                return null;
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
                return null;
            }
            return customer;
        }
        catch {
            return null;
        }
    }
    async getCurrentAdmin(request) {
        const token = this.extractAdminToken(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Authentication token is required.');
        }
        const demoToken = this.configService.get('app.adminDemoToken');
        if (this.isDevelopment() &&
            ((demoToken && token === demoToken) || token.startsWith('test_admin_token_'))) {
            const demoAdmin = await this.prisma.adminUser.findFirst({
                include: adminUserInclude,
                orderBy: { createdAt: 'asc' },
            });
            if (!demoAdmin) {
                throw new common_1.UnauthorizedException('Admin not found.');
            }
            return this.toAdminUser(demoAdmin);
        }
        const payload = this.verifyAuthToken(token);
        if (payload.role !== 'admin') {
            throw new common_1.UnauthorizedException('Admin role is required.');
        }
        const admin = await this.prisma.adminUser.findUnique({
            where: { id: payload.sub },
            include: adminUserInclude,
        });
        if (!admin || admin.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Admin not found.');
        }
        return this.toAdminUser(admin);
    }
    async listRoles() {
        const roles = await this.prisma.role.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        return roles.map((role) => ({
            id: role.id,
            key: role.key,
            name: role.name,
            description: role.description,
            permissions: role.permissions.map(({ permission }) => ({
                key: permission.key,
                name: permission.name,
            })),
        }));
    }
    async listAdminUsers(query) {
        const page = Math.max(1, query.page ?? 1);
        const pageSize = Math.max(1, query.pageSize ?? 20);
        const where = {
            AND: [
                query.q
                    ? {
                        OR: [
                            {
                                email: {
                                    contains: query.q,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                name: {
                                    contains: query.q,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    }
                    : {},
                query.status
                    ? {
                        status: query.status,
                    }
                    : {},
            ],
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.adminUser.findMany({
                where,
                include: adminUserInclude,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.adminUser.count({ where }),
        ]);
        return {
            items: items.map((item) => this.toAdminUser(item)),
            total,
            page,
            pageSize,
        };
    }
    async createAdminUser(payload) {
        const role = await this.prisma.role.findUnique({
            where: { id: payload.roleId },
        });
        if (!role) {
            throw new common_1.BadRequestException('Role not found.');
        }
        const exists = await this.prisma.adminUser.findFirst({
            where: {
                email: {
                    equals: payload.email,
                    mode: 'insensitive',
                },
            },
            select: { id: true },
        });
        if (exists) {
            throw new common_1.ConflictException('Admin email already exists.');
        }
        const admin = await this.prisma.adminUser.create({
            data: {
                email: payload.email.trim().toLowerCase(),
                name: payload.name.trim(),
                passwordHash: await (0, password_util_1.hashPassword)(payload.password),
                roleId: payload.roleId,
                status: payload.status ?? 'ACTIVE',
            },
            include: adminUserInclude,
        });
        return this.toAdminUser(admin);
    }
    async updateAdminUser(id, payload) {
        const existing = await this.prisma.adminUser.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Admin user not found.');
        }
        if (payload.roleId) {
            const role = await this.prisma.role.findUnique({
                where: { id: payload.roleId },
                select: { id: true },
            });
            if (!role) {
                throw new common_1.BadRequestException('Role not found.');
            }
        }
        const admin = await this.prisma.adminUser.update({
            where: { id },
            data: {
                name: payload.name?.trim(),
                roleId: payload.roleId,
                status: payload.status,
                passwordHash: payload.password
                    ? await (0, password_util_1.hashPassword)(payload.password)
                    : undefined,
            },
            include: adminUserInclude,
        });
        return this.toAdminUser(admin);
    }
    extractCustomerToken(request) {
        return this.extractToken(request, 'auth_token');
    }
    extractAdminToken(request) {
        return this.extractToken(request, 'admin_token');
    }
    extractToken(request, cookieName) {
        const cookies = request.cookies;
        const authorization = request.headers.authorization;
        if (authorization?.startsWith('Bearer ')) {
            return authorization.slice(7);
        }
        return cookies?.[cookieName];
    }
    isDevelopment() {
        return this.configService.get('app.nodeEnv') === 'development';
    }
    isGoogleAuthEnabled() {
        return this.configService.get('app.googleAuthEnabled') === true;
    }
    getGoogleClientId() {
        const clientId = this.configService.get('app.googleClientId');
        if (!clientId) {
            throw new common_1.NotFoundException('Google client id is not configured.');
        }
        return clientId;
    }
    getGoogleClientSecret() {
        const clientSecret = this.configService.get('app.googleClientSecret');
        if (!clientSecret) {
            throw new common_1.NotFoundException('Google client secret is not configured.');
        }
        return clientSecret;
    }
    getGoogleRedirectUri() {
        const redirectUri = this.configService.get('app.googleRedirectUri');
        if (!redirectUri) {
            throw new common_1.NotFoundException('Google redirect uri is not configured.');
        }
        return redirectUri;
    }
    async signToken(sub, email, role) {
        return this.jwtService.signAsync({ sub, email, role }, {
            secret: this.configService.get('app.jwtSecret'),
            expiresIn: '7d',
        });
    }
    verifyAuthToken(token) {
        return this.jwtService.verify(token, {
            secret: this.configService.get('app.jwtSecret'),
        });
    }
    async exchangeGoogleCode(code) {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: this.getGoogleClientId(),
                client_secret: this.getGoogleClientSecret(),
                redirect_uri: this.getGoogleRedirectUri(),
                grant_type: 'authorization_code',
            }).toString(),
        });
        const data = (await response.json().catch(() => ({})));
        if (!response.ok || !data.id_token) {
            throw new common_1.UnauthorizedException(data.error_description || 'Failed to exchange Google authorization code.');
        }
        return data;
    }
    parseGoogleIdToken(idToken) {
        if (!idToken) {
            throw new common_1.UnauthorizedException('Google ID token is missing.');
        }
        const parts = idToken.split('.');
        if (parts.length !== 3) {
            throw new common_1.UnauthorizedException('Google ID token is invalid.');
        }
        try {
            return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        }
        catch {
            throw new common_1.UnauthorizedException('Google ID token payload is invalid.');
        }
    }
    validateGoogleClaims(claims, nonce) {
        const now = Math.floor(Date.now() / 1000);
        const issuer = claims.iss;
        if (!claims.sub || !claims.email) {
            throw new common_1.UnauthorizedException('Google account does not include the required identity claims.');
        }
        if (claims.aud !== this.getGoogleClientId()) {
            throw new common_1.UnauthorizedException('Google token audience mismatch.');
        }
        if (issuer !== 'https://accounts.google.com' &&
            issuer !== 'accounts.google.com') {
            throw new common_1.UnauthorizedException('Google token issuer is invalid.');
        }
        if (!claims.exp || claims.exp <= now) {
            throw new common_1.UnauthorizedException('Google token has expired.');
        }
        if (claims.email_verified !== true) {
            throw new common_1.UnauthorizedException('Google email must be verified.');
        }
        if (!claims.nonce || claims.nonce !== nonce) {
            throw new common_1.UnauthorizedException('Google nonce validation failed.');
        }
    }
    async findOrCreateGoogleCustomer(claims) {
        const googleSub = claims.sub;
        const email = claims.email.toLowerCase();
        const now = new Date();
        const admin = await this.prisma.adminUser.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive',
                },
            },
            select: { id: true },
        });
        if (admin) {
            throw new common_1.BadRequestException('Google storefront sign-in cannot be used with admin accounts.');
        }
        let customer = (await this.prisma.customer.findUnique({ where: { googleSub } })) ??
            (await this.prisma.customer.findFirst({
                where: {
                    email: {
                        equals: email,
                        mode: 'insensitive',
                    },
                },
            }));
        if (!customer) {
            customer = await this.prisma.customer.create({
                data: {
                    email,
                    passwordHash: await (0, password_util_1.hashPassword)((0, node_crypto_1.randomUUID)()),
                    authProvider: 'GOOGLE',
                    googleSub,
                    avatarUrl: claims.picture,
                    firstName: claims.given_name,
                    lastName: claims.family_name,
                    lastLoginAt: now,
                },
            });
            return customer;
        }
        if (customer.googleSub && customer.googleSub !== googleSub) {
            throw new common_1.BadRequestException('This email is already linked to a different Google account.');
        }
        return this.prisma.customer.update({
            where: { id: customer.id },
            data: {
                authProvider: 'GOOGLE',
                googleSub,
                email,
                avatarUrl: claims.picture,
                firstName: claims.given_name ?? customer.firstName,
                lastName: claims.family_name ?? customer.lastName,
                lastLoginAt: now,
            },
        });
    }
    toAdminUser(admin) {
        const permissions = admin.role.permissions.map(({ permission }) => permission.key);
        return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'admin',
            adminRole: admin.role.key,
            permissions,
            lastLoginAt: admin.lastLoginAt?.toISOString() ?? undefined,
        };
    }
    toCustomerUser(customer) {
        return {
            id: customer.id,
            email: customer.email,
            firstName: customer.firstName ?? undefined,
            lastName: customer.lastName ?? undefined,
            phone: customer.phone ?? undefined,
            avatarUrl: customer.avatarUrl ?? undefined,
            authProvider: customer.authProvider.toLowerCase(),
            role: 'customer',
            lastLoginAt: customer.lastLoginAt?.toISOString() ?? undefined,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map