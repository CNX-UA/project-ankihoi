import { Test, TestingModule } from '@nestjs/testing';
import { DecksController } from '../../src/decks/decks.controller';
import { DecksService } from '../../src/decks/decks.service';
import { CreateDeckDto } from '../../src/decks/dto/create-deck.dto';
import { CreateCardDto } from '../../src/decks/dto/create-card.dto';

const mockDecksService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  createCard: jest.fn(),
  findCardsByDeck: jest.fn(),
  findCard: jest.fn(),
  updateCard: jest.fn(),
  removeCard: jest.fn(),
};

describe('DecksController', () => {
  let controller: DecksController;
  let service: typeof mockDecksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecksController],
      providers: [
        {
          provide: DecksService,
          useValue: mockDecksService,
        },
      ],
    }).compile();

    controller = module.get<DecksController>(DecksController);
    service = module.get(DecksService);
    jest.clearAllMocks();
  });

  describe('Decks CRUD endpoints', () => {
    it('should delegate create request to service', async () => {
      const dto: CreateDeckDto = {
        title: 'D1',
        description: 'Desc',
        userId: 'user-uuid',
      };
      service.create.mockResolvedValue({ id: 'deck-uuid', ...dto });
      const res = await controller.create(dto);
      expect(res.id).toBe('deck-uuid');
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should delegate findOne to service as string ID', async () => {
      service.findOne.mockResolvedValue({ id: 'deck-uuid' });
      const res = await controller.findOne('deck-uuid');
      expect(res.id).toBe('deck-uuid');
      expect(service.findOne).toHaveBeenCalledWith('deck-uuid');
    });
  });

  describe('Cards nested endpoints', () => {
    it('should delegate createCard request to service', async () => {
      const cardDto: CreateCardDto = { frontText: 'Q', backText: 'A' };
      service.createCard.mockResolvedValue({ id: 'card-uuid', ...cardDto });
      const res = await controller.createCard('deck-uuid', cardDto);
      expect(res.id).toBe('card-uuid');
      expect(service.createCard).toHaveBeenCalledWith('deck-uuid', cardDto);
    });
  });
});
