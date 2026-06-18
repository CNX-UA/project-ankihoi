import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prismaService: PrismaService) {}

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id // sub — це стандартне поле для ID юзера в JWT
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(details: any) {
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