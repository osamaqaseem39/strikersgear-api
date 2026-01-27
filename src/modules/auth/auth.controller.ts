import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('status')
  async status() {
    const hasAdmin = await this.authService.hasAdmin();
    return { hasAdmin };
  }

  @Public()
  @Post('register')
  register(@Body() body: { password: string }) {
    return this.authService.register(body.password);
  }

  @Public()
  @Post('login')
  login(@Body() body: { password: string }) {
    return this.authService.login(body.password);
  }
}
