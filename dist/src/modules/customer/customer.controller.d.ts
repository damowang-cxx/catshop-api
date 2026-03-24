import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
export declare class CustomerController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listCustomers(query: PaginationQueryDto): Promise<{
        items: {
            status: string;
            lastLoginAt: string | undefined;
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
