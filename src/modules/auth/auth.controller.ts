import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import {
  GoogleAuthorizeQueryDto,
  GoogleCallbackDto,
} from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Post('register')
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Get('google/url')
  googleUrl(@Query() query: GoogleAuthorizeQueryDto) {
    return this.authService.getGoogleAuthorizationUrl(query);
  }

  @Post('google/callback')
  googleCallback(@Body() payload: GoogleCallbackDto) {
    return this.authService.authenticateWithGoogle(payload);
  }

  @Post('logout')
  logout() {
    return { success: true };
  }

  @Get('me')
  me(@Req() request: FastifyRequest) {
    return this.authService.getCurrentUser(request);
  }
}
