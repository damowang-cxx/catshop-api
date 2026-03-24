import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminMeController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() payload: LoginDto) {
    return this.authService.loginAdmin(payload);
  }

  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Get('me')
  me(@Req() request: FastifyRequest) {
    return this.authService.getCurrentAdmin(request);
  }
}
