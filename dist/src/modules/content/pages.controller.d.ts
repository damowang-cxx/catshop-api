import { ContentService } from './content.service';
export declare class PagesController {
    private readonly contentService;
    constructor(contentService: ContentService);
    listPages(): {
        handle: string;
        title: string;
        body: string;
        seo: {
            title: string;
            description: string;
        };
    }[];
    getPage(handle: string): {
        handle: string;
        title: string;
        body: string;
        seo: {
            title: string;
            description: string;
        };
    };
}
