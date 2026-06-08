import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Database Test Started ---');

  // Cleanup old test data
  await prisma.user.deleteMany({
    where: { email: 'test-user@example.com' }
  });

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      email: 'test-user@example.com',
      name: 'Test User',
      providerId: 'oauth-provider-123',
    },
  });
  console.log('Created User:', user);

  // 2. Create Deck
  const deck = await prisma.deck.create({
    data: {
      title: 'Spanish Vocab',
      description: 'Basic Spanish words',
      userId: user.id,
    },
  });
  console.log('Created Deck:', deck);

  // 3. Create Card
  const card = await prisma.card.create({
    data: {
      frontText: 'Hola',
      backText: 'Hello',
      deckId: deck.id,
      easinessFactor: 2.5,
      repetitions: 0,
      intervalDays: 1,
      nextReview: new Date(),
    },
  });
  console.log('Created Card:', card);

  // 4. Create Review History
  const review = await prisma.reviewHistory.create({
    data: {
      cardId: card.id,
      score: 5,
      reviewedAt: new Date(),
    },
  });
  console.log('Created Review History:', review);

  // 5. Query and Verify Relationships
  const queriedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      decks: {
        include: {
          cards: {
            include: {
              reviewHistory: true,
            },
          },
        },
      },
    },
  });
  console.log('Queried User with Relations:', JSON.stringify(queriedUser, null, 2));

  // 6. Test Cascade Delete
  console.log('Deleting User to test Cascade Delete...');
  await prisma.user.delete({
    where: { id: user.id },
  });

  const cardsCount = await prisma.card.count({
    where: { id: card.id },
  });
  const reviewsCount = await prisma.reviewHistory.count({
    where: { id: review.id },
  });

  console.log(`Remaining Cards matching deleted card ID: ${cardsCount} (Expected: 0)`);
  console.log(`Remaining Review Histories matching deleted review ID: ${reviewsCount} (Expected: 0)`);

  if (cardsCount === 0 && reviewsCount === 0) {
    console.log('--- Database Test Succeeded (Cascade Delete Verified) ---');
  } else {
    throw new Error('Cascade delete check failed!');
  }
}

main()
  .catch((err) => {
    console.error('--- Database Test Failed ---');
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
