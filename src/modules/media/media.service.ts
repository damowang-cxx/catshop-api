import {
  BadRequestException,
  Injectable,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MultipartFile } from '@fastify/multipart';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

@Injectable()
export class MediaService {
  constructor(private readonly configService: ConfigService) {}

  async upload(file?: MultipartFile) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const allowedMimeTypes =
      this.configService.get<string[]>('upload.allowedMimeTypes') ?? [];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException('Unsupported image type.');
    }

    const extension = this.extensionFor(file.mimetype);
    const uploadDirectory = join(process.cwd(), 'storage', 'uploads');
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
    const buffer = await file.toBuffer();

    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(join(uploadDirectory, filename), buffer);

    const appUrl = this.configService.get<string>('app.url') ?? 'http://localhost:3001';
    return {
      url: `${appUrl}/uploads/${filename}`,
    };
  }

  private extensionFor(mimeType: string) {
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
}
