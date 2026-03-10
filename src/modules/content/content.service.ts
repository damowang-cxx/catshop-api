import { Injectable, NotFoundException } from '@nestjs/common';
import { MockDatabaseService } from '../../shared/mock-database.service';

@Injectable()
export class ContentService {
  constructor(private readonly mockDb: MockDatabaseService) {}

  getMenu(handle: string) {
    const menu = this.mockDb.menus.find((candidate) => candidate.handle === handle);
    return menu?.items ?? [];
  }

  getPage(handle: string) {
    const page = this.mockDb.pages.find((candidate) => candidate.handle === handle);
    if (!page) {
      throw new NotFoundException('Page not found.');
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
}
