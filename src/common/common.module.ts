import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthGuard } from './auth/admin-auth.guard';
import { CustomerAuthGuard } from './auth/customer-auth.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [JwtModule.register({}), PrismaModule],
  providers: [AdminAuthGuard, CustomerAuthGuard, PermissionsGuard],
  exports: [AdminAuthGuard, CustomerAuthGuard, PermissionsGuard, JwtModule],
})
export class CommonModule {}
