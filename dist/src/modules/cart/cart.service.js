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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const mock_database_service_1 = require("../../shared/mock-database.service");
let CartService = class CartService {
    mockDb;
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    createCart() {
        const now = new Date().toISOString();
        const cart = {
            id: this.mockDb.createId('cart'),
            currencyCode: 'USD',
            items: [],
            createdAt: now,
            updatedAt: now,
        };
        this.mockDb.carts.push(cart);
        return this.serializeCart(cart.id);
    }
    getCart(id) {
        return this.serializeCart(id);
    }
    addLines(cartId, payload) {
        const cart = this.findCart(cartId);
        payload.lines.forEach((line) => {
            const product = this.findProductByMerchandise(line.merchandiseId);
            const existing = cart.items.find((item) => item.merchandiseId === line.merchandiseId);
            if (existing) {
                existing.quantity += line.quantity;
            }
            else {
                cart.items.push({
                    id: this.mockDb.createId('line'),
                    merchandiseId: line.merchandiseId,
                    quantity: line.quantity,
                    productId: product.id,
                });
            }
        });
        cart.updatedAt = new Date().toISOString();
        return this.serializeCart(cartId);
    }
    updateLines(cartId, payload) {
        const cart = this.findCart(cartId);
        payload.lines.forEach((line) => {
            const cartLine = cart.items.find((item) => item.id === line.id);
            if (cartLine) {
                const product = this.findProductByMerchandise(line.merchandiseId);
                cartLine.merchandiseId = line.merchandiseId;
                cartLine.productId = product.id;
                cartLine.quantity = line.quantity;
            }
        });
        cart.updatedAt = new Date().toISOString();
        return this.serializeCart(cartId);
    }
    removeLines(cartId, payload) {
        const cart = this.findCart(cartId);
        cart.items = cart.items.filter((item) => !payload.lineIds.includes(item.id));
        cart.updatedAt = new Date().toISOString();
        return this.serializeCart(cartId);
    }
    serializeCart(id) {
        const cart = this.findCart(id);
        const lines = cart.items.map((line) => {
            const product = this.mockDb.products.find((candidate) => candidate.id === line.productId);
            const variant = product?.variants[0];
            const unitPrice = product?.price ?? 0;
            return {
                id: line.id,
                quantity: line.quantity,
                cost: {
                    totalAmount: {
                        amount: (unitPrice * line.quantity).toFixed(2),
                        currencyCode: cart.currencyCode,
                    },
                },
                merchandise: {
                    id: line.merchandiseId,
                    title: variant?.title ?? 'Default',
                    selectedOptions: variant?.selectedOptions ?? [],
                    product: product
                        ? {
                            id: product.id,
                            handle: product.handle,
                            title: product.title,
                            featuredImage: product.featuredImage ?? undefined,
                        }
                        : undefined,
                },
            };
        });
        const subtotal = lines.reduce((sum, line) => sum + Number.parseFloat(line.cost.totalAmount.amount), 0);
        return {
            id: cart.id,
            checkoutUrl: '/checkout',
            items: lines,
            lines,
            subtotal: {
                amount: subtotal.toFixed(2),
                currencyCode: cart.currencyCode,
            },
            total: {
                amount: subtotal.toFixed(2),
                currencyCode: cart.currencyCode,
            },
            tax: {
                amount: '0.00',
                currencyCode: cart.currencyCode,
            },
            cost: {
                subtotalAmount: {
                    amount: subtotal.toFixed(2),
                    currencyCode: cart.currencyCode,
                },
                totalAmount: {
                    amount: subtotal.toFixed(2),
                    currencyCode: cart.currencyCode,
                },
                totalTaxAmount: {
                    amount: '0.00',
                    currencyCode: cart.currencyCode,
                },
            },
            totalQuantity: cart.items.reduce((sum, line) => sum + line.quantity, 0),
        };
    }
    findCart(id) {
        const cart = this.mockDb.carts.find((candidate) => candidate.id === id);
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found.');
        }
        return cart;
    }
    findProductByMerchandise(merchandiseId) {
        const product = this.mockDb.products.find((candidate) => candidate.id === merchandiseId) ??
            this.mockDb.products.find((candidate) => candidate.variants.some((variant) => variant.id === merchandiseId));
        if (!product) {
            throw new common_1.NotFoundException('Product not found.');
        }
        return product;
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_database_service_1.MockDatabaseService])
], CartService);
//# sourceMappingURL=cart.service.js.map