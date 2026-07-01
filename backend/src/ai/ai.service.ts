import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { CardStyle } from './dto/generate-cards-multimodal.dto';
import { CardDifficulty } from './dto/generate-cards.dto';

const DIFFICULTY_INSTRUCTIONS: Record<CardDifficulty, string> = {
  [CardDifficulty.LIGHT]:
    'Generate basic recall questions, straightforward definitions, and clear factual queries.',
  [CardDifficulty.MEDIUM]:
    'Generate standard factual questions, intermediate concepts, and general knowledge application.',
  [CardDifficulty.HARD]:
    'Generate analytical questions, requiring synthesis of concepts, context analysis, and critical evaluations.',
  [CardDifficulty.ULTRA]:
    'Generate deep conceptual challenges, scenario-based problem solving, edge-case evaluations, and advanced logic analysis.',
};

const STRICT_BOUNDARY_INSTRUCTION =
  'You must only use the facts and information explicitly mentioned in the provided notes or files. Do not extrapolate, assume, or draw from external knowledge.';

export interface CardProposal {
  question: string;
  answer: string;
}

export interface ClozeProposal {
  text: string;
  clozes: string[];
}

export interface MultipleChoiceProposal {
  question: string;
  options: string[];
  answer: string;
}

export type MultimodalCardProposal =
  | CardProposal
  | ClozeProposal
  | MultipleChoiceProposal;

const AUDIT_SYSTEM_INSTRUCTION =
  'You are an expert editor. Your job is to audit and reformulate study cards to ensure they are logically unambiguous and have a unique, precise answer.\n' +
  'Specifically, identify questions that are too broad or open-ended but have a specific, singular answer (e.g. "What film did Quentin Tarantino direct?" -> "Pulp Fiction").\n' +
  'For any such card, reformulate the question/prompt to add specific context (such as release year, characters, key actors, or distinguishing plot points) so that the answer is uniquely correct and logically follows from the question.\n' +
  'If a card is already precise, logical, and unambiguous, leave it completely unmodified.\n' +
  'Return the final audited array of cards matching the exact count, format, and structure of the input.';

const BASE_SYSTEM_INSTRUCTION =
  "You are an expert study assistant. Analyze the user's input notes and extract key concepts to generate study cards. " +
  'Generate only high-quality concepts. Do not include conversational filler in questions or answers.';

interface StyleConfig {
  systemInstruction: string;
  schema: Record<string, any>;
}

const STYLE_CONFIGS: Record<CardStyle, StyleConfig> = {
  [CardStyle.Q_A]: {
    systemInstruction: `${BASE_SYSTEM_INSTRUCTION} Generate standard Question and Answer pairs.`,
    schema: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          question: { type: 'STRING' },
          answer: { type: 'STRING' },
        },
        required: ['question', 'answer'],
      },
    },
  },
  [CardStyle.CLOZE]: {
    systemInstruction: `${BASE_SYSTEM_INSTRUCTION} Generate Cloze deletion cards where key terms are removed from the "text" string. The "clozes" array should list the words/phrases that were removed.`,
    schema: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          text: { type: 'STRING' },
          clozes: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
        required: ['text', 'clozes'],
      },
    },
  },
  [CardStyle.MULTIPLE_CHOICE]: {
    systemInstruction: `${BASE_SYSTEM_INSTRUCTION} Generate Multiple Choice cards with 3-4 options and one correct answer.`,
    schema: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          question: { type: 'STRING' },
          options: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
          answer: { type: 'STRING' },
        },
        required: ['question', 'options', 'answer'],
      },
    },
  },
};

@Injectable()
export class AiService {
  private readonly ai: GoogleGenAI;
  private readonly logger = new Logger(AiService.name);

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateCards(
    notes?: string,
    count = 9,
    difficulty: CardDifficulty = CardDifficulty.MEDIUM,
    deckTitle?: string,
    deckDescription?: string,
  ): Promise<CardProposal[]> {
    const hasNotes = notes && notes.trim();

    if (!hasNotes && (!deckTitle || !deckTitle.trim())) {
      throw new BadRequestException(
        'Notes content or deck title cannot be empty',
      );
    }

    try {
      const config = STYLE_CONFIGS[CardStyle.Q_A];
      const difficultyText =
        DIFFICULTY_INSTRUCTIONS[difficulty] ||
        DIFFICULTY_INSTRUCTIONS[CardDifficulty.MEDIUM];

      let contents = '';
      let systemInstruction = config.systemInstruction + ' ' + difficultyText;

      if (hasNotes) {
        contents = `Generate exactly ${count} Q&A cards from the following notes. Do not generate more or fewer than this number:\n---\n${notes}\n---`;
        systemInstruction += ' ' + STRICT_BOUNDARY_INSTRUCTION;
      } else {
        contents = `Generate exactly ${count} Q&A cards about the subject '${deckTitle}' described as '${deckDescription || ''}' using your built-in general knowledge. Do not generate more or fewer than this number.`;
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: config.schema,
        },
      });

      if (!response.text) {
        throw new Error('Empty response received from Gemini API');
      }

      const cards = JSON.parse(response.text) as CardProposal[];
      return this.auditAndReformulateCards(cards, CardStyle.Q_A) as Promise<
        CardProposal[]
      >;
    } catch (error) {
      this.logger.error(
        `Gemini card generation error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        `Failed to generate cards: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async generateCardsMultimodal(
    file: Express.Multer.File,
    style: CardStyle,
    count = 9,
    difficulty: CardDifficulty = CardDifficulty.MEDIUM,
  ): Promise<MultimodalCardProposal[]> {
    if (!file) {
      throw new BadRequestException('Uploaded file is required');
    }
    if (!file.buffer) {
      throw new BadRequestException('Uploaded file is empty or corrupt');
    }

    const config = STYLE_CONFIGS[style];
    if (!config) {
      throw new BadRequestException(`Unsupported card style: ${style}`);
    }

    try {
      const filePart = {
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      };

      const difficultyText =
        DIFFICULTY_INSTRUCTIONS[difficulty] ||
        DIFFICULTY_INSTRUCTIONS[CardDifficulty.MEDIUM];
      const systemInstruction =
        config.systemInstruction +
        ' ' +
        difficultyText +
        ' ' +
        STRICT_BOUNDARY_INSTRUCTION;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          filePart,
          `Generate exactly ${count} study cards from this document matching the requested style. Do not generate more or fewer than this number.`,
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: config.schema,
        },
      });

      if (!response.text) {
        throw new Error('Empty response received from Gemini API');
      }

      const cards = JSON.parse(response.text) as MultimodalCardProposal[];
      return this.auditAndReformulateCards(cards, style);
    } catch (error) {
      this.logger.error(
        `Gemini multimodal card generation error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        `Failed to generate multimodal cards: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async auditAndReformulateCards(
    cards: MultimodalCardProposal[],
    style: CardStyle,
  ): Promise<MultimodalCardProposal[]> {
    if (!cards || cards.length === 0) {
      return cards;
    }

    try {
      const config = STYLE_CONFIGS[style];
      const contents = `Audit and reformulate the following cards to ensure they are logical and unambiguous:\n---\n${JSON.stringify(cards, null, 2)}\n---`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: AUDIT_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: config.schema,
        },
      });

      if (!response.text) {
        this.logger.warn(
          'Critic returned empty response, falling back to original cards',
        );
        return cards;
      }

      return JSON.parse(response.text) as MultimodalCardProposal[];
    } catch (error) {
      this.logger.error(
        `Critic logic audit error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Fallback to original cards on audit failure to guarantee service availability
      return cards;
    }
  }
}
