import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';

@ApiTags('menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly contentService: ContentService) {}

  @Get(':handle')
  getMenu(@Param('handle') handle: string) {
    return this.contentService.getMenu(handle);
  }
}
