import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { GenerateCardsDto } from './dto/generate-cards.dto';
import { GenerateCardsMultimodalDto } from './dto/generate-cards-multimodal.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-cards')
  generateCards(@Body() generateCardsDto: GenerateCardsDto) {
    return this.aiService.generateCards(
      generateCardsDto.notes,
      generateCardsDto.count,
      generateCardsDto.difficulty,
      generateCardsDto.deckTitle,
      generateCardsDto.deckDescription,
    );
  }

  @Post('generate-cards/multimodal')
  @UseInterceptors(FileInterceptor('file'))
  async generateCardsMultimodal(
    @UploadedFile() file: Express.Multer.File,
    @Body() generateCardsMultimodalDto: GenerateCardsMultimodalDto,
  ) {
    if (!file) {
      throw new BadRequestException('Uploaded file is required');
    }
    return this.aiService.generateCardsMultimodal(
      file,
      generateCardsMultimodalDto.style,
      generateCardsMultimodalDto.count,
      generateCardsMultimodalDto.difficulty,
    );
  }
}
