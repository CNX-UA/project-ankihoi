import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';


@Injectable()
// Ми наслідуємося від PassportStrategy і вказуємо назву стратегії 'google'
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      // ID клієнта, який ми отримали в Google Cloud Console
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      
      // Секретний ключ клієнта (бережемо в .env!)
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      
      // URL, на який Google перенаправить користувача після успішного входу
      callbackURL: 'http://localhost:3001/auth/google/callback',
      
      // Які дані ми хочемо отримати від Google (email та профіль)
      scope: ['email', 'profile'],
    });
  }

  // Цей метод викликається автоматично після того, як Google підтвердив особу юзера
  async validate(
    accessToken: string, 
    refreshToken: string, 
    profile: any, 
    done: VerifyCallback
  ): Promise<any> {
    const {id, name, emails } = profile;
    
    // Формуємо об'єкт юзера з даних, які повернув Google
    const user = {
      providerId: id,
      email: emails[0].value,
      firstName: name.givenName || null,
      lastName: name.familyName || null,    
      accessToken,
    }; 
    // TODO(me): Виклич метод валідації з AuthService, про який ми говорили раніше
    const validatedUser = await this.authService.validateUser(user);
    // Повертаємо об'єкт юзера в Passport, який потім "покладе" його в req.user
    done(null, validatedUser);

  }
}
