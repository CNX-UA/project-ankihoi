import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeckDto: CreateDeckDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createDeckDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${createDeckDto.userId} not found`);
    }

    return this.prisma.deck.create({
      data: {
        title: createDeckDto.title,
        description: createDeckDto.description,
        userId: createDeckDto.userId,
        initialEasinessFactor: createDeckDto.initialEasinessFactor,
      },
    });
  }

  async findAll() {
    const now = new Date();
    const decks = await this.prisma.deck.findMany({
      include: {
        _count: {
          select: { cards: true },
        },
        cards: {
          where: {
            nextReview: {
              lte: now,
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    return decks.map((deck) => ({
      ...deck,
      dueCardsCount: deck.cards.length,
    }));
  }

  async findOne(id: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id },
      include: {
        cards: true,
      },
    });
    if (!deck) {
      throw new NotFoundException(`Deck with ID ${id} not found`);
    }
    return deck;
  }

  async update(id: string, updateDeckDto: UpdateDeckDto) {
    await this.findOne(id);

    return this.prisma.deck.update({
      where: { id },
      data: {
        title: updateDeckDto.title,
        description: updateDeckDto.description,
        userId: updateDeckDto.userId,
        initialEasinessFactor: updateDeckDto.initialEasinessFactor,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.deck.delete({
      where: { id },
    });
  }

  // Cards Nested Actions
  async createCard(deckId: string, createCardDto: CreateCardDto) {
    const deck = await this.findOne(deckId);

    return this.prisma.card.create({
      data: {
        frontText: createCardDto.frontText,
        backText: createCardDto.backText,
        deckId,
        easinessFactor: deck.initialEasinessFactor ?? 2.5,
        repetitions: 0,
        intervalDays: 0,
        nextReview: new Date(),
      },
    });
  }

  async findCardsByDeck(deckId: string) {
    await this.findOne(deckId);

    return this.prisma.card.findMany({
      where: { deckId },
    });
  }

  async findCard(deckId: string, cardId: string) {
    await this.findOne(deckId);

    const card = await this.prisma.card.findFirst({
      where: { id: cardId, deckId },
    });
    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found in Deck ${deckId}`);
    }
    return card;
  }

  async updateCard(deckId: string, cardId: string, updateCardDto: UpdateCardDto) {
    await this.findCard(deckId, cardId);

    return this.prisma.card.update({
      where: { id: cardId },
      data: {
        frontText: updateCardDto.frontText,
        backText: updateCardDto.backText,
        easinessFactor: updateCardDto.easinessFactor,
        repetitions: updateCardDto.repetitions,
        intervalDays: updateCardDto.intervalDays,
        nextReview: updateCardDto.nextReview ? new Date(updateCardDto.nextReview) : undefined,
      },
    });
  }

  async removeCard(deckId: string, cardId: string) {
    await this.findCard(deckId, cardId);

    return this.prisma.card.delete({
      where: { id: cardId },
    });
  }
}
