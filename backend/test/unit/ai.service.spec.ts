import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../../src/ai/ai.service';
import {
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CardStyle } from '../../src/ai/dto/generate-cards-multimodal.dto';
import { CardDifficulty } from '../../src/ai/dto/generate-cards.dto';

const mockGenerateContent = jest.fn().mockImplementation(async (args) => {
  const isCritic = args?.config?.systemInstruction?.includes('logical and unambiguous') || false;
  if (isCritic) {
    const match = args.contents.match(/---\n([\s\S]*)\n---/);
    if (match && match[1]) {
      return { text: match[1] };
    }
    return { text: '[]' };
  }
  return { text: '[]' };
});

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    }),
  };
});

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    process.env.GEMINI_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error in constructor if GEMINI_API_KEY is not defined', () => {
    delete process.env.GEMINI_API_KEY;
    expect(() => new AiService()).toThrow(
      'GEMINI_API_KEY environment variable is not defined',
    );
  });

  describe('generateCards', () => {
    it('should throw BadRequestException if notes content is empty', async () => {
      await expect(service.generateCards('   ')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully parse and return card proposals', async () => {
      const mockResponse = {
        text: JSON.stringify([
          {
            question: 'What is NestJS?',
            answer: 'A progressive Node.js framework.',
          },
          {
            question: 'What is TypeScript?',
            answer: 'A typed superset of JavaScript.',
          },
        ]),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generateCards(
        'Some notes about NestJS and TypeScript',
      );
      expect(result).toHaveLength(2);
      expect(result[0].question).toBe('What is NestJS?');
      expect(result[1].answer).toBe('A typed superset of JavaScript.');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('should pass count parameter in prompt instructions to Gemini', async () => {
      mockGenerateContent.mockResolvedValue({ text: '[]' });
      await service.generateCards('Some notes', 12);
      expect(mockGenerateContent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          contents: expect.stringContaining('12'),
        }),
      );
    });

    it('should throw BadRequestException if both notes and fallback title are empty', async () => {
      await expect(service.generateCards('')).rejects.toThrow(BadRequestException);
    });

    it('should pass correct difficulty system instruction to Gemini', async () => {
      mockGenerateContent.mockResolvedValue({ text: '[]' });
      await service.generateCards('Some notes', 9, CardDifficulty.ULTRA);
      expect(mockGenerateContent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            systemInstruction: expect.stringContaining('deep conceptual challenges'),
          }),
        }),
      );
    });

    it('should pass strict note containment instruction to Gemini under normal generation', async () => {
      mockGenerateContent.mockResolvedValue({ text: '[]' });
      await service.generateCards('Some notes');
      expect(mockGenerateContent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            systemInstruction: expect.stringContaining('only use the facts and information explicitly mentioned'),
          }),
        }),
      );
    });

    it('should generate fallback general knowledge cards if notes are empty', async () => {
      mockGenerateContent.mockResolvedValue({ text: '[]' });
      await service.generateCards('', 10, CardDifficulty.MEDIUM, 'Physics', 'Basics of physics');
      expect(mockGenerateContent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          contents: expect.stringContaining("subject 'Physics' described as 'Basics of physics' using your built-in general knowledge"),
          config: expect.objectContaining({
            systemInstruction: expect.not.stringContaining('only use the facts and information explicitly mentioned'),
          }),
        }),
      );
    });

    it('should throw InternalServerErrorException if API returns empty text', async () => {
      mockGenerateContent.mockResolvedValue({ text: '' });

      await expect(service.generateCards('Some notes')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if API call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API quota exceeded'));

      await expect(service.generateCards('Some notes')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('generateCardsMultimodal', () => {
    const mockFile = {
      buffer: Buffer.from('test file content'),
      mimetype: 'application/pdf',
    } as Express.Multer.File;

    it('should throw BadRequestException if file is missing', async () => {
      await expect(
        service.generateCardsMultimodal(
          null as unknown as Express.Multer.File,
          CardStyle.Q_A,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file buffer is missing', async () => {
      await expect(
        service.generateCardsMultimodal(
          { mimetype: 'application/pdf' } as unknown as Express.Multer.File,
          CardStyle.Q_A,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully parse and return Q_A style card proposals', async () => {
      const mockResponse = {
        text: JSON.stringify([{ question: 'Q1', answer: 'A1' }]),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generateCardsMultimodal(
        mockFile,
        CardStyle.Q_A,
      );
      expect(result).toEqual([{ question: 'Q1', answer: 'A1' }]);
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('should successfully parse and return CLOZE style card proposals', async () => {
      const mockResponse = {
        text: JSON.stringify([
          { text: 'NestJS is a Node.js framework.', clozes: ['NestJS'] },
        ]),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generateCardsMultimodal(
        mockFile,
        CardStyle.CLOZE,
      );
      expect(result).toEqual([
        { text: 'NestJS is a Node.js framework.', clozes: ['NestJS'] },
      ]);
    });

    it('should successfully parse and return MULTIPLE_CHOICE style card proposals', async () => {
      const mockResponse = {
        text: JSON.stringify([
          { question: 'Q1', options: ['O1', 'O2'], answer: 'O1' },
        ]),
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await service.generateCardsMultimodal(
        mockFile,
        CardStyle.MULTIPLE_CHOICE,
      );
      expect(result).toEqual([
        { question: 'Q1', options: ['O1', 'O2'], answer: 'O1' },
      ]);
    });

    it('should pass count parameter in multimodal prompt to Gemini', async () => {
      mockGenerateContent.mockResolvedValue({ text: '[]' });
      await service.generateCardsMultimodal(mockFile, CardStyle.Q_A, 15);
      expect(mockGenerateContent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          contents: expect.arrayContaining([
            expect.any(Object),
            expect.stringContaining('15'),
          ]),
        }),
      );
    });

    it('should pass difficulty and strict note containment instruction to Gemini for multimodal', async () => {
      mockGenerateContent.mockResolvedValue({ text: '[]' });
      await service.generateCardsMultimodal(mockFile, CardStyle.Q_A, 9, CardDifficulty.HARD);
      expect(mockGenerateContent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            systemInstruction: expect.stringContaining('analytical questions'),
          }),
        }),
      );
      expect(mockGenerateContent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            systemInstruction: expect.stringContaining('only use the facts and information explicitly mentioned'),
          }),
        }),
      );
    });

    it('should throw InternalServerErrorException if API call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Gemini error'));

      await expect(
        service.generateCardsMultimodal(mockFile, CardStyle.Q_A),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('auditAndReformulateCards', () => {
    it('should pass correct systemInstruction to critic call', async () => {
      mockGenerateContent.mockResolvedValue({ text: '[]' });
      await service.auditAndReformulateCards([{ question: 'Q1', answer: 'A1' }], CardStyle.Q_A);
      expect(mockGenerateContent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            systemInstruction: expect.stringContaining('logically unambiguous'),
          }),
        }),
      );
    });

    it('should return original cards if critic call fails', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Critic failure'));
      const originalCards = [{ question: 'Q1', answer: 'A1' }];
      const result = await service.auditAndReformulateCards(originalCards, CardStyle.Q_A);
      expect(result).toEqual(originalCards);
    });
  });
});
