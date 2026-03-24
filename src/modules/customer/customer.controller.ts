import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { PERMISSIONS } from '../../common/auth/permissions.constants';
import { RequiresPermissions } from '../../common/auth/permissions.decorator';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @RequiresPermissions(PERMISSIONS.customersRead)
  @Get()
  async listCustomers(@Query() query: PaginationQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 20);
    const where = query.q
      ? {
          email: {
            contains: query.q,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items: items.map((customer) => ({
        ...customer,
        status: customer.status.toLowerCase(),
        lastLoginAt: customer.lastLoginAt?.toISOString() ?? undefined,
      })),
      total,
      page,
      pageSize,
    };
  }
}
