"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDatabaseService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const mock_seed_1 = require("./mock-seed");
let MockDatabaseService = class MockDatabaseService {
    state = (0, mock_seed_1.createMockSeed)();
    admins = this.state.admins;
    brands = this.state.brands;
    carts = this.state.carts;
    collections = this.state.collections;
    customers = this.state.customers;
    menus = this.state.menus;
    orders = this.state.orders;
    pages = this.state.pages;
    products = this.state.products;
    createId(prefix) {
        return `${prefix}_${(0, node_crypto_1.randomUUID)().replace(/-/g, '').slice(0, 12)}`;
    }
};
exports.MockDatabaseService = MockDatabaseService;
exports.MockDatabaseService = MockDatabaseService = __decorate([
    (0, common_1.Injectable)()
], MockDatabaseService);
//# sourceMappingURL=mock-database.service.js.map