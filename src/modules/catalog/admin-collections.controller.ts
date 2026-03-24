import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { PERMISSIONS } from '../../common/auth/permissions.constants';
import { RequiresPermissions } from '../../common/auth/permissions.decorator';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { BulkActionRequestDto } from '../../common/dto/bulk-action-request.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CatalogService } from './catalog.service';
import { CreateCollectionDto } from './dto/create-collection.dto';

@ApiTags('admin-collections')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('admin/collections')
export class AdminCollectionsController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @RequiresPermissions(PERMISSIONS.catalogRead)
  listCollections(@Query() query: PaginationQueryDto) {
    return this.catalogService.listAdminCollections(query);
  }

  @Post()
  @RequiresPermissions(PERMISSIONS.catalogWrite)
  createCollection(@Body() payload: CreateCollectionDto) {
    return this.catalogService.createCollection(payload);
  }

  @Post('bulk')
  @RequiresPermissions(PERMISSIONS.catalogWrite)
  bulkCollections(@Body() payload: BulkActionRequestDto) {
    return this.catalogService.applyCollectionBulkAction(payload);
  }

  @Get(':idOrHandle')
  @RequiresPermissions(PERMISSIONS.catalogRead)
  getCollection(@Param('idOrHandle') idOrHandle: string) {
    return this.catalogService.getAdminCollection(idOrHandle);
  }

  @Put(':id')
  @RequiresPermissions(PERMISSIONS.catalogWrite)
  updateCollection(
    @Param('id') id: string,
    @Body() payload: Partial<CreateCollectionDto>,
  ) {
    return this.catalogService.updateCollection(id, payload);
  }

  @Delete(':id')
  @RequiresPermissions(PERMISSIONS.catalogWrite)
  deleteCollection(@Param('id') id: string) {
    return this.catalogService.deleteCollection(id);
  }
}
