import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { MultipartFile } from '@fastify/multipart';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { MediaService } from './media.service';

@ApiTags('upload')
@Controller('upload')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(AdminAuthGuard)
  @Post()
  async upload(@Req() request: FastifyRequest) {
    const file = (await (
      request as FastifyRequest & { file: () => Promise<unknown> }
    ).file()) as MultipartFile | undefined;
    return this.mediaService.upload(file);
  }
}
