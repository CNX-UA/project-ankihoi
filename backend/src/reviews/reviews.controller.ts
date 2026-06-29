import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ReviewsService, ReviewResponse } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createReviewDto: CreateReviewDto): Promise<ReviewResponse> {
    return this.reviewsService.reviewCard(createReviewDto);
  }
}
