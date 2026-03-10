import { ContentService } from './content.service';
export declare class MenusController {
    private readonly contentService;
    constructor(contentService: ContentService);
    getMenu(handle: string): {
        title: string;
        path: string;
    }[];
}
