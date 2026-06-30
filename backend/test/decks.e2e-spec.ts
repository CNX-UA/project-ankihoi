import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Decks & Cards (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Create a dummy user for the test to satisfy foreign key constraints
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        providerId: 'google-oauth2|12345',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (prisma && userId) {
      // Cleanup database
      await prisma.user.deleteMany({
        where: { id: userId },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('Decks CRUD', () => {
    let deckId: string;

    it('POST /decks - should validate invalid DTO (missing title)', async () => {
      await request(app.getHttpServer())
        .post('/decks')
        .send({
          description: 'No title',
          userId,
        })
        .expect(400);
    });

    it('POST /decks - should create a deck', async () => {
      const response = await request(app.getHttpServer())
        .post('/decks')
        .send({
          title: 'My E2E Deck',
          description: 'Created during test',
          userId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('My E2E Deck');
      deckId = response.body.id;
    });

    it('GET /decks - should list decks', async () => {
      const response = await request(app.getHttpServer())
        .get('/decks')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /decks/:id - should get deck detail', async () => {
      const response = await request(app.getHttpServer())
        .get(`/decks/${deckId}`)
        .expect(200);

      expect(response.body.id).toBe(deckId);
      expect(Array.isArray(response.body.cards)).toBe(true);
    });

    it('PATCH /decks/:id - should update deck details', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/decks/${deckId}`)
        .send({
          title: 'My Updated E2E Deck',
        })
        .expect(200);

      expect(response.body.title).toBe('My Updated E2E Deck');
    });

    describe('Nested Cards CRUD', () => {
      let cardId: string;

      it('POST /decks/:deckId/cards - should create a card', async () => {
        const response = await request(app.getHttpServer())
          .post(`/decks/${deckId}/cards`)
          .send({
            frontText: 'Front Card',
            backText: 'Back Card',
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.frontText).toBe('Front Card');
        cardId = response.body.id;
      });

      it('GET /decks/:deckId/cards - should list cards under deck', async () => {
        const response = await request(app.getHttpServer())
          .get(`/decks/${deckId}/cards`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0].id).toBe(cardId);
      });

      it('GET /decks/:deckId/cards/:cardId - should get card details', async () => {
        const response = await request(app.getHttpServer())
          .get(`/decks/${deckId}/cards/${cardId}`)
          .expect(200);

        expect(response.body.id).toBe(cardId);
      });

      it('PATCH /decks/:deckId/cards/:cardId - should update card details', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/decks/${deckId}/cards/${cardId}`)
          .send({
            frontText: 'Front Card Updated',
          })
          .expect(200);

        expect(response.body.frontText).toBe('Front Card Updated');
      });

      it('DELETE /decks/:deckId/cards/:cardId - should delete card', async () => {
        await request(app.getHttpServer())
          .delete(`/decks/${deckId}/cards/${cardId}`)
          .expect(200);

        // Verify deleted
        await request(app.getHttpServer())
          .get(`/decks/${deckId}/cards/${cardId}`)
          .expect(404);
      });
    });

    it('DELETE /decks/:id - should delete deck', async () => {
      await request(app.getHttpServer()).delete(`/decks/${deckId}`).expect(200);

      // Verify deleted
      await request(app.getHttpServer()).get(`/decks/${deckId}`).expect(404);
    });
  });
});
