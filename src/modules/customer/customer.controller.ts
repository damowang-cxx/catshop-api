import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { paginate } from '../../common/utils/pagination';
import { MockDatabaseService } from '../../shared/mock-database.service';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly mockDb: MockDatabaseService) {}

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Get()
  listCustomers(@Query() query: PaginationQueryDto) {
    let customers = [...this.mockDb.customers];

    if (query.q) {
      const keyword = query.q.toLowerCase();
      customers = customers.filter((customer) =>
        customer.email.toLowerCase().includes(keyword),
      );
    }

    return paginate(
      customers.map((customer) => ({
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        status: customer.status,
        lastLoginAt: customer.lastLoginAt,
      })),
      query,
    );
  }
}
