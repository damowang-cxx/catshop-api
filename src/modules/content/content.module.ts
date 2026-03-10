import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { MenusController } from './menus.controller';
import { PagesController } from './pages.controller';

@Module({
  controllers: [MenusController, PagesController],
  providers: [ContentService],
})
export class ContentModule {}
