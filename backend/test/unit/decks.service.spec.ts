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

  describe('findAll', () => {
    it('should return all decks with dueCardsCount mapped correctly', async () => {
      prisma.deck.findMany.mockResolvedValue([
        {
          id: 'deck-1',
          title: 'Deck 1',
          cards: [{ id: 'card-1' }, { id: 'card-2' }],
          _count: { cards: 5 }
        }
      ]);

      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].dueCardsCount).toBe(2);
      expect(prisma.deck.findMany).toHaveBeenCalledWith(expect.objectContaining({
        include: expect.objectContaining({
          cards: expect.objectContaining({
            where: expect.objectContaining({
              nextReview: expect.any(Object)
            })
          })
        })
      }));
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
    it('should successfully create a card with default easinessFactor of 2.5 if deck initialEasinessFactor is not set', async () => {
      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-uuid', initialEasinessFactor: null });
      prisma.card.create.mockImplementation(({ data }) => Promise.resolve({ id: 'card-uuid', ...data }));

      const result = await service.createCard('deck-uuid', { frontText: 'Front', backText: 'Back' });
      expect(result.easinessFactor).toBe(2.5);
      expect(prisma.card.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          easinessFactor: 2.5,
        }),
      }));
    });

    it('should successfully create a card with deck initialEasinessFactor if defined', async () => {
      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-uuid', initialEasinessFactor: 1.8 });
      prisma.card.create.mockImplementation(({ data }) => Promise.resolve({ id: 'card-uuid', ...data }));

      const result = await service.createCard('deck-uuid', { frontText: 'Front', backText: 'Back' });
      expect(result.easinessFactor).toBe(1.8);
      expect(prisma.card.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          easinessFactor: 1.8,
        }),
      }));
    });
  });

  describe('update', () => {
    it('should update and return the deck if exists', async () => {
      const updateDto = { title: 'Updated Deck', description: 'Updated Desc' };
      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-uuid', title: 'Old Title' });
      prisma.deck.update.mockResolvedValue({ id: 'deck-uuid', ...updateDto });

      const result = await service.update('deck-uuid', updateDto);
      expect(result.title).toBe('Updated Deck');
      expect(prisma.deck.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException on update if deck does not exist', async () => {
      prisma.deck.findUnique.mockResolvedValue(null);
      await expect(service.update('invalid-deck', { title: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete and return the deck if exists', async () => {
      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-uuid', title: 'To Delete' });
      prisma.deck.delete.mockResolvedValue({ id: 'deck-uuid' });

      const result = await service.remove('deck-uuid');
      expect(result.id).toBe('deck-uuid');
      expect(prisma.deck.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException on remove if deck does not exist', async () => {
      prisma.deck.findUnique.mockResolvedValue(null);
      await expect(service.remove('invalid-deck')).rejects.toThrow(NotFoundException);
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
