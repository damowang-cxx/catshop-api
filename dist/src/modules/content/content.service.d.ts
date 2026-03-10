import { MockDatabaseService } from '../../shared/mock-database.service';
export declare class ContentService {
    private readonly mockDb;
    constructor(mockDb: MockDatabaseService);
    getMenu(handle: string): {
        title: string;
        path: string;
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
    listPages(): {
        handle: string;
        title: string;
        body: string;
        seo: {
            title: string;
            description: string;
        };
    }[];
}
