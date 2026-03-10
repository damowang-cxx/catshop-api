import { ConfigService } from '@nestjs/config';
import { MultipartFile } from '@fastify/multipart';
export declare class MediaService {
    private readonly configService;
    constructor(configService: ConfigService);
    upload(file?: MultipartFile): Promise<{
        url: string;
    }>;
    private extensionFor;
}
