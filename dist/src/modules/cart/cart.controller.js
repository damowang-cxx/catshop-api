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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../auth/auth.service");
const cart_service_1 = require("./cart.service");
const add_cart_lines_dto_1 = require("./dto/add-cart-lines.dto");
const remove_cart_lines_dto_1 = require("./dto/remove-cart-lines.dto");
let CartController = class CartController {
    cartService;
    authService;
    constructor(cartService, authService) {
        this.cartService = cartService;
        this.authService = authService;
    }
    async resolveCustomerId(request) {
        const customer = await this.authService.tryGetCurrentCustomer(request);
        return customer?.id;
    }
    async getCart(id, request) {
        return this.cartService.getCart(id, await this.resolveCustomerId(request));
    }
    async createCart(request) {
        return this.cartService.createCart(await this.resolveCustomerId(request));
    }
    async addCartItems(id, payload, request) {
        return this.cartService.addLines(id, payload, await this.resolveCustomerId(request));
    }
    async updateCartItems(id, payload, request) {
        return this.cartService.updateLines(id, payload, await this.resolveCustomerId(request));
    }
    async removeCartItems(id, payload, request) {
        return this.cartService.removeLines(id, payload, await this.resolveCustomerId(request));
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "createCart", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_cart_lines_dto_1.AddCartLinesDto, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "addCartItems", null);
__decorate([
    (0, common_1.Patch)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_cart_lines_dto_1.AddCartLinesDto, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "updateCartItems", null);
__decorate([
    (0, common_1.Delete)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, remove_cart_lines_dto_1.RemoveCartLinesDto, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removeCartItems", null);
exports.CartController = CartController = __decorate([
    (0, swagger_1.ApiTags)('cart'),
    (0, common_1.Controller)('cart'),
    __metadata("design:paramtypes", [cart_service_1.CartService,
        auth_service_1.AuthService])
], CartController);
//# sourceMappingURL=cart.controller.js.map