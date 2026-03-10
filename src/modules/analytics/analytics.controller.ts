import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Get('stats')
  getStats() {
    return this.analyticsService.getAdminStats();
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Get('analytics/overview')
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Get('analytics/sales')
  getSales() {
    return this.analyticsService.getSales();
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Get('analytics/traffic')
  getTraffic() {
    return this.analyticsService.getTraffic();
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Get('analytics/channels')
  getChannels() {
    return this.analyticsService.getChannels();
  }
}
