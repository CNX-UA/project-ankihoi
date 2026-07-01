import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BatchCreateCardsDto } from './dto/batch-create-cards.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('decks')
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Post()
  create(@Body() createDeckDto: CreateDeckDto, @CurrentUser() user: User) {
    createDeckDto.userId = user.id;
    return this.decksService.create(createDeckDto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.decksService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.decksService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeckDto: UpdateDeckDto,
    @CurrentUser() user: User,
  ) {
    return this.decksService.update(id, user.id, updateDeckDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.decksService.remove(id, user.id);
  }

  // Nested Cards endpoints under /decks/:deckId/cards
  @Post(':deckId/cards')
  createCard(
    @Param('deckId') deckId: string,
    @Body() createCardDto: CreateCardDto,
    @CurrentUser() user: User,
  ) {
    return this.decksService.createCard(user.id, deckId, createCardDto);
  }

  @Get(':deckId/cards')
  findCards(@Param('deckId') deckId: string, @CurrentUser() user: User) {
    return this.decksService.findCardsByDeck(user.id, deckId);
  }

  @Get(':deckId/cards/:cardId')
  findCard(
    @Param('deckId') deckId: string,
    @Param('cardId') cardId: string,
    @CurrentUser() user: User,
  ) {
    return this.decksService.findCard(user.id, deckId, cardId);
  }

  @Patch(':deckId/cards/:cardId')
  updateCard(
    @Param('deckId') deckId: string,
    @Param('cardId') cardId: string,
    @Body() updateCardDto: UpdateCardDto,
    @CurrentUser() user: User,
  ) {
    return this.decksService.updateCard(user.id, deckId, cardId, updateCardDto);
  }

  @Delete(':deckId/cards/:cardId')
  removeCard(
    @Param('deckId') deckId: string,
    @Param('cardId') cardId: string,
    @CurrentUser() user: User,
  ) {
    return this.decksService.removeCard(user.id, deckId, cardId);
  }

  @Post(':deckId/cards/batch')
  createCardsBatch(
    @Param('deckId') deckId: string,
    @Body() batchCreateCardsDto: BatchCreateCardsDto,
    @CurrentUser() user: User,
  ) {
    return this.decksService.createCardsBatch(
      user.id,
      deckId,
      batchCreateCardsDto,
    );
  }
}
