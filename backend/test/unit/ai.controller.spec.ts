import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from '../../src/ai/ai.controller';
import { AiService } from '../../src/ai/ai.service';
import { GenerateCardsDto, CardDifficulty } from '../../src/ai/dto/generate-cards.dto';
import {
  GenerateCardsMultimodalDto,
  CardStyle,
} from '../../src/ai/dto/generate-cards-multimodal.dto';
import { BadRequestException } from '@nestjs/common';

const mockAiService = {
  generateCards: jest.fn(),
  generateCardsMultimodal: jest.fn(),
};

describe('AiController', () => {
  let controller: AiController;
  let service: typeof mockAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    service = module.get(AiService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateCards', () => {
    it('should delegate request to service', async () => {
      const dto: GenerateCardsDto = {
        notes: 'Sample text notes for generation.',
        count: 12,
        difficulty: CardDifficulty.HARD,
        deckTitle: 'Deck Title',
        deckDescription: 'Deck Description',
      };
      const expectedProposals = [{ question: 'Q1', answer: 'A1' }];
      service.generateCards.mockResolvedValue(expectedProposals);

      const result = await controller.generateCards(dto);
      expect(result).toEqual(expectedProposals);
      expect(service.generateCards).toHaveBeenCalledWith(
        dto.notes,
        dto.count,
        dto.difficulty,
        dto.deckTitle,
        dto.deckDescription,
      );
    });
  });

  describe('generateCardsMultimodal', () => {
    const mockFile = {
      buffer: Buffer.from('file content'),
      mimetype: 'application/pdf',
    } as Express.Multer.File;

    it('should throw BadRequestException if file is missing', async () => {
      const dto: GenerateCardsMultimodalDto = { style: CardStyle.Q_A };
      await expect(
        controller.generateCardsMultimodal(
          null as unknown as Express.Multer.File,
          dto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should delegate request to service if file is provided', async () => {
      const dto: GenerateCardsMultimodalDto = { style: CardStyle.Q_A, count: 15, difficulty: CardDifficulty.LIGHT };
      const expectedProposals = [{ question: 'Q1', answer: 'A1' }];
      service.generateCardsMultimodal.mockResolvedValue(expectedProposals);

      const result = await controller.generateCardsMultimodal(mockFile, dto);
      expect(result).toEqual(expectedProposals);
      expect(service.generateCardsMultimodal).toHaveBeenCalledWith(
        mockFile,
        dto.style,
        dto.count,
        dto.difficulty,
      );
    });
  });
});
