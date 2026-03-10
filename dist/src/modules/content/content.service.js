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
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const mock_database_service_1 = require("../../shared/mock-database.service");
let ContentService = class ContentService {
    mockDb;
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    getMenu(handle) {
        const menu = this.mockDb.menus.find((candidate) => candidate.handle === handle);
        return menu?.items ?? [];
    }
    getPage(handle) {
        const page = this.mockDb.pages.find((candidate) => candidate.handle === handle);
        if (!page) {
            throw new common_1.NotFoundException('Page not found.');
        }
        return {
            handle: page.handle,
            title: page.title,
            body: page.body,
            seo: {
                title: page.seoTitle ?? page.title,
                description: page.seoDescription ?? page.body,
            },
        };
    }
    listPages() {
        return this.mockDb.pages.map((page) => ({
            handle: page.handle,
            title: page.title,
            body: page.body,
            seo: {
                title: page.seoTitle ?? page.title,
                description: page.seoDescription ?? page.body,
            },
        }));
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_database_service_1.MockDatabaseService])
], ContentService);
//# sourceMappingURL=content.service.js.map