import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';

@ApiTags('pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  listPages() {
    return this.contentService.listPages();
  }

  @Get(':handle')
  getPage(@Param('handle') handle: string) {
    return this.contentService.getPage(handle);
  }
}
