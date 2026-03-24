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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const promises_1 = require("node:fs/promises");
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
let MediaService = class MediaService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async upload(file) {
        if (!file) {
            throw new common_1.BadRequestException('File is required.');
        }
        const allowedMimeTypes = this.configService.get('upload.allowedMimeTypes') ?? [];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.UnsupportedMediaTypeException('Unsupported image type.');
        }
        const extension = this.extensionFor(file.mimetype);
        const uploadDirectory = (0, node_path_1.join)(process.cwd(), 'storage', 'uploads');
        const filename = `${Date.now()}-${(0, node_crypto_1.randomUUID)().slice(0, 8)}.${extension}`;
        const buffer = await file.toBuffer();
        await (0, promises_1.mkdir)(uploadDirectory, { recursive: true });
        await (0, promises_1.writeFile)((0, node_path_1.join)(uploadDirectory, filename), buffer);
        const appUrl = this.configService.get('app.url') ?? 'http://127.0.0.1:3001';
        return {
            url: `${appUrl}/uploads/${filename}`,
        };
    }
    extensionFor(mimeType) {
        switch (mimeType) {
            case 'image/png':
                return 'png';
            case 'image/webp':
                return 'webp';
            case 'image/avif':
                return 'avif';
            default:
                return 'jpg';
        }
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MediaService);
//# sourceMappingURL=media.service.js.map