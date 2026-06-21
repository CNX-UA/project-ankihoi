import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

export interface OAuthProfile {
  providerId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  accessToken?: string;
}

export interface JwtPayload {
  email: string;
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prismaService: PrismaService) {}

  async login(user: User) {
    const payload: JwtPayload = { 
      email: user.email, 
      sub: user.id 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(details: OAuthProfile): Promise<User> {
    let user = await this.prismaService.user.findUnique({
      where: { email: details.email },
    });
    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          email: details.email,
          name: details.firstName + ' ' + details.lastName,
          providerId: details.providerId,
          },
      });
    }
    return user;
}
}