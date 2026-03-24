import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminMeController } from './admin-me.controller';
import { AdminUsersController } from './admin-users.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController, AdminMeController, AdminUsersController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
