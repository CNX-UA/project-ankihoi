import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { DecksModule } from './decks/decks.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [PrismaModule, DecksModule, AuthModule, ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
