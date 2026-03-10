import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthGuard } from './auth/admin-auth.guard';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [AdminAuthGuard],
  exports: [AdminAuthGuard, JwtModule],
})
export class CommonModule {}
