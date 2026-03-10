import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { MockDatabaseService } from '../../shared/mock-database.service';
export declare class CustomerController {
    private readonly mockDb;
    constructor(mockDb: MockDatabaseService);
    listCustomers(query: PaginationQueryDto): import("../../common/utils/pagination").PaginatedResponse<{
        id: string;
        email: string;
        firstName: string | undefined;
        lastName: string | undefined;
        phone: string | undefined;
        status: "active" | "locked";
        lastLoginAt: string | undefined;
    }>;
}
