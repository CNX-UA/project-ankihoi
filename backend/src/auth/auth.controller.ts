import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import type { User } from '@prisma/client';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly redirectUrl =
    process.env.FRONTEND_URL || 'http://localhost:3000';

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@CurrentUser() user: User, @Res() res: Response) {
    const token = await this.authService.login(user);
    res.redirect(
      `${this.redirectUrl}/auth-success?token=${token.access_token}`,
    );
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@CurrentUser() user: User, @Res() res: Response) {
    const token = await this.authService.login(user);
    res.redirect(
      `${this.redirectUrl}/auth-success?token=${token.access_token}`,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
