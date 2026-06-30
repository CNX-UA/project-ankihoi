import { Test, TestingModule } from '@nestjs/testing';
import { DecksService } from '../../src/decks/decks.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CardDifficulty } from '../../src/ai/dto/generate-cards.dto';

const mockPrismaService: any = {
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
  user: {
    findUnique: jest.fn(),
  },
  deck: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  card: {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DecksService', () => {
  let service: DecksService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DecksService>(DecksService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a deck if user exists', async () => {
      const createDto = {
        title: 'Test Deck',
        description: 'Desc',
        userId: 'user-uuid',
      };
      prisma.user.findUnique.mockResolvedValue({ id: 'user-uuid' });
      prisma.deck.create.mockResolvedValue({ id: 'deck-uuid', ...createDto });

      const result = await service.create(createDto);
      expect(result).toBeDefined();
      expect(result.id).toBe('deck-uuid');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
      });
      expect(prisma.deck.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const createDto = {
        title: 'Test Deck',
        description: 'Desc',
        userId: 'invalid-user',
      };
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return deck details if exists', async () => {
      prisma.deck.findUnique.mockResolvedValue({
        id: 'deck-uuid',
        title: 'Deck 1',
        cards: [],
      });
      const result = await service.findOne('deck-uuid');
      expect(result.id).toBe('deck-uuid');
    });

    it('should throw NotFoundException if deck does not exist', async () => {
      prisma.deck.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-deck')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createCard', () => {
    it('should successfully create a card if deck exists', async () => {
      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-uuid' });
      prisma.card.create.mockResolvedValue({
        id: 'card-uuid',
        frontText: 'Front',
        backText: 'Back',
        deckId: 'deck-uuid',
      });

      const result = await service.createCard('deck-uuid', {
        frontText: 'Front',
        backText: 'Back',
      });
      expect(result.id).toBe('card-uuid');
    });
  });

  describe('findCard', () => {
    it('should throw NotFoundException if card does not belong to the deck', async () => {
      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-uuid' });
      prisma.card.findFirst.mockResolvedValue(null);

      await expect(service.findCard('deck-uuid', 'card-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createCardsBatch', () => {
    it('should successfully batch insert cards to an existing deck if user owns it', async () => {
      const mockDeck = { id: 'deck-uuid', title: 'Deck 1', userId: 'user-1' };
      prisma.deck.findUnique.mockResolvedValue(mockDeck);
      prisma.card.createMany.mockResolvedValue({ count: 2 });

      const dto = {
        cards: [
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
        ],
      };

      const result = await service.createCardsBatch('user-1', 'deck-uuid', dto);
      expect(result).toBeDefined();
      expect(prisma.deck.findUnique).toHaveBeenCalled();
      expect(prisma.card.createMany).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user does not own the deck', async () => {
      const mockDeck = {
        id: 'deck-uuid',
        title: 'Deck 1',
        userId: 'other-user',
      };
      prisma.deck.findUnique.mockResolvedValue(mockDeck);

      const dto = {
        cards: [{ question: 'Q1', answer: 'A1' }],
      };

      await expect(
        service.createCardsBatch('user-1', 'deck-uuid', dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create a new deck and batch insert cards if deckId is "new"', async () => {
      const mockNewDeck = {
        id: 'new-deck-uuid',
        title: 'New Deck',
        userId: 'user-1',
      };
      prisma.deck.create.mockResolvedValue(mockNewDeck);
      prisma.deck.findUnique.mockResolvedValue({ ...mockNewDeck, cards: [] });
      prisma.card.createMany.mockResolvedValue({ count: 1 });

      const dto = {
        newDeckTitle: 'New Deck',
        newDeckDescription: 'Desc',
        cards: [{ question: 'Q1', answer: 'A1' }],
      };

      const result = await service.createCardsBatch('user-1', 'new', dto);
      expect(result).toBeDefined();
      expect(prisma.deck.create).toHaveBeenCalledWith({
        data: { title: 'New Deck', description: 'Desc', userId: 'user-1' },
      });
      expect(prisma.card.createMany).toHaveBeenCalled();
    });

    it('should map difficulty parameters to custom easiness factors and intervals in database save calls', async () => {
      const mockDeck = { id: 'deck-uuid', title: 'Deck 1', userId: 'user-1' };
      prisma.deck.findUnique.mockResolvedValue(mockDeck);
      prisma.card.createMany.mockResolvedValue({ count: 1 });

      const dto = {
        cards: [{ question: 'Q1', answer: 'A1' }],
        difficulty: CardDifficulty.ULTRA,
      };

      await service.createCardsBatch('user-1', 'deck-uuid', dto);
      expect(prisma.card.createMany).toHaveBeenLastCalledWith({
        data: [{
          frontText: 'Q1',
          backText: 'A1',
          deckId: 'deck-uuid',
          easinessFactor: 1.8,
          repetitions: 0,
          intervalDays: 1,
          nextReview: expect.any(Date),
        }],
      });
    });
  });
});
