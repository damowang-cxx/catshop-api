import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { RequiresPermissions } from '../../common/auth/permissions.decorator';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { PERMISSIONS } from '../../common/auth/permissions.constants';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthService } from './auth.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@ApiTags('admin-users')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('admin')
export class AdminUsersController {
  constructor(private readonly authService: AuthService) {}

  @Get('roles')
  @RequiresPermissions(PERMISSIONS.adminsRead)
  listRoles() {
    return this.authService.listRoles();
  }

  @Get('admin-users')
  @RequiresPermissions(PERMISSIONS.adminsRead)
  listAdminUsers(@Query() query: PaginationQueryDto) {
    return this.authService.listAdminUsers(query);
  }

  @Post('admin-users')
  @RequiresPermissions(PERMISSIONS.adminsWrite)
  createAdminUser(@Body() payload: CreateAdminUserDto) {
    return this.authService.createAdminUser(payload);
  }

  @Patch('admin-users/:id')
  @RequiresPermissions(PERMISSIONS.adminsWrite)
  updateAdminUser(@Param('id') id: string, @Body() payload: UpdateAdminUserDto) {
    return this.authService.updateAdminUser(id, payload);
  }
}
