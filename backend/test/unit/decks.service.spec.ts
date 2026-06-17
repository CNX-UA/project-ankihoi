import { Test, TestingModule } from '@nestjs/testing';
import { DecksService } from '../../src/decks/decks.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
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
      const createDto = { title: 'Test Deck', description: 'Desc', userId: 'user-uuid' };
      prisma.user.findUnique.mockResolvedValue({ id: 'user-uuid' });
      prisma.deck.create.mockResolvedValue({ id: 'deck-uuid', ...createDto });

      const result = await service.create(createDto);
      expect(result).toBeDefined();
      expect(result.id).toBe('deck-uuid');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-uuid' } });
      expect(prisma.deck.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const createDto = { title: 'Test Deck', description: 'Desc', userId: 'invalid-user' };
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return deck details if exists', async () => {
      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-uuid', title: 'Deck 1', cards: [] });
      const result = await service.findOne('deck-uuid');
      expect(result.id).toBe('deck-uuid');
    });

    it('should throw NotFoundException if deck does not exist', async () => {
      prisma.deck.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-deck')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCard', () => {
    it('should successfully create a card if deck exists', async () => {
      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-uuid' });
      prisma.card.create.mockResolvedValue({ id: 'card-uuid', frontText: 'Front', backText: 'Back', deckId: 'deck-uuid' });

      const result = await service.createCard('deck-uuid', { frontText: 'Front', backText: 'Back' });
      expect(result.id).toBe('card-uuid');
    });
  });

  describe('findCard', () => {
    it('should throw NotFoundException if card does not belong to the deck', async () => {
      prisma.deck.findUnique.mockResolvedValue({ id: 'deck-uuid' });
      prisma.card.findFirst.mockResolvedValue(null);

      await expect(service.findCard('deck-uuid', 'card-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
