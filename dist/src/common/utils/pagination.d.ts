import { PaginationQueryDto } from '../dto/pagination-query.dto';
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
export declare function paginate<T>(items: T[], query: PaginationQueryDto): PaginatedResponse<T>;
