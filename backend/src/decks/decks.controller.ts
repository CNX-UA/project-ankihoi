import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('decks')
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Post()
  create(@Body() createDeckDto: CreateDeckDto) {
    return this.decksService.create(createDeckDto);
  }

  @Get()
  findAll() {
    return this.decksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.decksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeckDto: UpdateDeckDto) {
    return this.decksService.update(id, updateDeckDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.decksService.remove(id);
  }

  // Nested Cards endpoints under /decks/:deckId/cards
  @Post(':deckId/cards')
  createCard(
    @Param('deckId') deckId: string,
    @Body() createCardDto: CreateCardDto,
  ) {
    return this.decksService.createCard(deckId, createCardDto);
  }

  @Get(':deckId/cards')
  findCards(@Param('deckId') deckId: string) {
    return this.decksService.findCardsByDeck(deckId);
  }

  @Get(':deckId/cards/:cardId')
  findCard(
    @Param('deckId') deckId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.decksService.findCard(deckId, cardId);
  }

  @Patch(':deckId/cards/:cardId')
  updateCard(
    @Param('deckId') deckId: string,
    @Param('cardId') cardId: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.decksService.updateCard(deckId, cardId, updateCardDto);
  }

  @Delete(':deckId/cards/:cardId')
  removeCard(
    @Param('deckId') deckId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.decksService.removeCard(deckId, cardId);
  }
}
