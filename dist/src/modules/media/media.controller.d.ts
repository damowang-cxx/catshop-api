import type { FastifyRequest } from 'fastify';
import { MediaService } from './media.service';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    upload(request: FastifyRequest): Promise<{
        url: string;
    }>;
}
