import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { ReviewsService, ReviewResponse } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: User,
  ): Promise<ReviewResponse> {
    return this.reviewsService.reviewCard(user.id, createReviewDto);
  }
}
