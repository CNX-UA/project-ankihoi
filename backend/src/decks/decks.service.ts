import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BatchCreateCardsDto } from './dto/batch-create-cards.dto';
import { CardDifficulty } from '../ai/dto/generate-cards.dto';

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeckDto: CreateDeckDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createDeckDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createDeckDto.userId} not found`,
      );
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

  async findAll(userId: string) {
    const now = new Date();
    const decks = await this.prisma.deck.findMany({
      where: { userId },
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

  async findOne(id: string, userId: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id },
      include: {
        cards: true,
      },
    });
    if (!deck) {
      throw new NotFoundException(`Deck with ID ${id} not found`);
    }
    if (deck.userId !== userId) {
      throw new ForbiddenException(
        `Deck with ID ${id} is not owned by user ${userId}`,
      );
    }
    return deck;
  }

  async update(id: string, userId: string, updateDeckDto: UpdateDeckDto) {
    await this.findOne(id, userId);

    return this.prisma.deck.update({
      where: { id },
      data: {
        title: updateDeckDto.title,
        description: updateDeckDto.description,
        userId: userId,
        initialEasinessFactor: updateDeckDto.initialEasinessFactor,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.deck.delete({
      where: { id },
    });
  }

  // Cards Nested Actions
  async createCard(userId: string, deckId: string, createCardDto: CreateCardDto) {
    const deck = await this.findOne(deckId, userId);

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

  async findCardsByDeck(userId: string, deckId: string) {
    await this.findOne(deckId, userId);

    return this.prisma.card.findMany({
      where: { deckId },
    });
  }

  async findCard(userId: string, deckId: string, cardId: string) {
    await this.findOne(deckId, userId);

    const card = await this.prisma.card.findFirst({
      where: { id: cardId, deckId },
    });
    if (!card) {
      throw new NotFoundException(
        `Card with ID ${cardId} not found in Deck ${deckId}`,
      );
    }
    return card;
  }

  async updateCard(
    userId: string,
    deckId: string,
    cardId: string,
    updateCardDto: UpdateCardDto,
  ) {
    await this.findCard(userId, deckId, cardId);

    return this.prisma.card.update({
      where: { id: cardId },
      data: {
        frontText: updateCardDto.frontText,
        backText: updateCardDto.backText,
        easinessFactor: updateCardDto.easinessFactor,
        repetitions: updateCardDto.repetitions,
        intervalDays: updateCardDto.intervalDays,
        nextReview: updateCardDto.nextReview
          ? new Date(updateCardDto.nextReview)
          : undefined,
      },
    });
  }

  async removeCard(userId: string, deckId: string, cardId: string) {
    await this.findCard(userId, deckId, cardId);

    return this.prisma.card.delete({
      where: { id: cardId },
    });
  }

  async createCardsBatch(
    userId: string,
    deckId: string,
    dto: BatchCreateCardsDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      let targetDeckId = deckId;

      if (deckId === 'new') {
        if (!dto.newDeckTitle) {
          throw new BadRequestException('Title is required for a new deck');
        }
        const newDeck = await tx.deck.create({
          data: {
            title: dto.newDeckTitle,
            description: dto.newDeckDescription || '',
            userId,
          },
        });
        targetDeckId = newDeck.id;
      } else {
        const deck = await tx.deck.findUnique({
          where: { id: deckId },
        });
        if (!deck) {
          throw new NotFoundException(`Deck with ID ${deckId} not found`);
        }
        if (deck.userId !== userId) {
          throw new ForbiddenException(
            `Deck with ID ${deckId} is not owned by user ${userId}`,
          );
        }
      }

      if (dto.cards && dto.cards.length > 0) {
        const difficulty = dto.difficulty || CardDifficulty.MEDIUM;
        const difficultyEFMap: Record<CardDifficulty, number> = {
          [CardDifficulty.LIGHT]: 2.7,
          [CardDifficulty.MEDIUM]: 2.5,
          [CardDifficulty.HARD]: 2.2,
          [CardDifficulty.ULTRA]: 1.8,
        };
        const easinessFactor = difficultyEFMap[difficulty] ?? 2.5;

        const cardsData = dto.cards.map((card) => ({
          frontText: card.question,
          backText: card.answer,
          deckId: targetDeckId,
          easinessFactor,
          repetitions: 0,
          intervalDays: 1, // Interval = 1 day
          nextReview: new Date(),
        }));

        await tx.card.createMany({
          data: cardsData,
        });
      }

      return tx.deck.findUnique({
        where: { id: targetDeckId },
        include: { cards: true },
      });
    });
  }
}
