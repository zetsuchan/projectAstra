import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { feedItems, predictionMarkets, users, polls, pollOptions } from './schema';

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL not set');
}

const client = postgres(connectionString);
const db = drizzle(client);

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000);
const daysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await db.delete(feedItems);
  await db.delete(predictionMarkets);

  // ============================================================================
  // FEED ITEMS
  // ============================================================================
  const feedData = [
    // ASTRA ALERTS - Transit announcements
    {
      type: 'personal' as const,
      title: 'Mercury Retrograde Incoming',
      body: "Mercury stations retrograde February 26th in Pisces. Back up your photos, screenshot those DMs, and maybe don't send that risky text until March 20th. You've been warned.",
      tags: ['mercury', 'retrograde', 'pisces', 'transit'],
      source: 'ai' as const,
      createdAt: hoursAgo(1),
    },
    {
      type: 'personal' as const,
      title: 'Saturn Enters Aries',
      body: "The taskmaster planet moves into warrior energy this year. Time to get serious about what you're fighting for. Saturn hasn't been in Aries since 1999 — we're entering a whole new discipline era.",
      tags: ['saturn', 'aries', 'transit', 'major'],
      source: 'ai' as const,
      createdAt: hoursAgo(3),
    },
    {
      type: 'personal' as const,
      title: 'Venus Retrograde Season Approaches',
      body: "Venus will station retrograde later this year. Exes will resurface. Old aesthetic choices will haunt you. Start journaling about your relationship patterns now so you're not blindsided.",
      tags: ['venus', 'retrograde', 'relationships'],
      source: 'ai' as const,
      createdAt: hoursAgo(6),
    },

    // POP ASTRO - Celebrity content with astrology angle
    {
      type: 'celebrity' as const,
      title: "Timothée & Kylie Go IG Official",
      body: "The Golden Globe winner (Capricorn Sun) and the beauty mogul (Leo Sun) finally hard-launched on Instagram. Fire and Earth? With his Saturn Return wrapping up, he's locking in. Leo wants to be seen. This tracks.",
      tags: ['timothee', 'kylie', 'capricorn', 'leo', 'celebrity'],
      source: 'ai' as const,
      createdAt: hoursAgo(2),
    },
    {
      type: 'celebrity' as const,
      title: "Rocky vs Drake: The Saga Continues",
      body: "A$AP Rocky's new track 'Stole Ya Flow' has bars aimed at a certain Canadian. Rocky (Libra Sun) choosing peace? Not this time. With Mars in his chart activated, he's done being diplomatic.",
      tags: ['asap-rocky', 'drake', 'libra', 'music', 'beef'],
      source: 'ai' as const,
      createdAt: hoursAgo(4),
    },
    {
      type: 'celebrity' as const,
      title: 'Taylor & Selena Golden Globes Gossip',
      body: "The Sagittarius and Cancer besties were caught whispering at the Golden Globes. Water and Fire signs sharing secrets? Whatever they know, we need to know.",
      tags: ['taylor-swift', 'selena-gomez', 'sagittarius', 'cancer'],
      source: 'ai' as const,
      createdAt: hoursAgo(8),
    },

    // GLOBAL WATCH - Finance/markets + astrology
    {
      type: 'tea' as const,
      title: 'YouTube Exits Billboard',
      body: "YouTube no longer factors into Billboard charts, effective immediately. Mercury in Aquarius energy — the old systems are breaking down. Streaming wars just got interesting.",
      tags: ['music-industry', 'youtube', 'billboard', 'mercury', 'aquarius'],
      source: 'human' as const,
      createdAt: hoursAgo(5),
    },
    {
      type: 'tea' as const,
      title: 'Fashion Week Kicks Off',
      body: "Milan Menswear FW26 runs Jan 16-20, Paris follows Jan 20-25, then Haute Couture Jan 26-29. The Sun in Aquarius season means experimental fits incoming. Expect the unexpected.",
      tags: ['fashion-week', 'milan', 'paris', 'aquarius', 'style'],
      source: 'human' as const,
      createdAt: hoursAgo(7),
    },
    {
      type: 'tea' as const,
      title: 'Ludacris Drops Out of Tour',
      body: "After backlash, Ludacris (Virgo Sun) pulled out of the Kid Rock tour. Virgos eventually choose their reputation. Nelly's still in it though — Scorpios gonna Scorpio.",
      tags: ['ludacris', 'music', 'virgo', 'tour'],
      source: 'human' as const,
      createdAt: hoursAgo(9),
    },

    // PROMPT - Engagement content
    {
      type: 'prompt' as const,
      title: 'Mercury Retrograde Prep Check',
      body: "Mercury stations retrograde in 6 weeks. What's one conversation you need to have BEFORE communication gets messy? Drop it in your diary.",
      tags: ['prompt', 'mercury', 'retrograde', 'reflection'],
      source: 'ai' as const,
      createdAt: hoursAgo(10),
    },
  ];

  await db.insert(feedItems).values(feedData);
  console.log(`✅ Inserted ${feedData.length} feed items`);

  // ============================================================================
  // PREDICTION MARKETS
  // ============================================================================
  const marketData = [
    // FEATURED
    {
      question: 'Will Kylie & Timothée last through Venus Retrograde?',
      category: 'pop_culture' as const,
      yesPercent: '34',
      noPercent: '66',
      volumeCents: '24042000', // $240k
      endsAt: daysFromNow(45),
      featured: true,
      astroTags: ['venus', 'retrograde', 'relationships'],
    },

    // TRENDING
    {
      question: 'Will Rihanna drop R9 before Jupiter enters Cancer?',
      category: 'trending' as const,
      yesPercent: '12',
      noPercent: '88',
      volumeCents: '14200000', // $142k
      endsAt: daysFromNow(180),
      featured: false,
      astroTags: ['jupiter', 'cancer', 'music'],
    },
    {
      question: 'Will Mercury Retrograde crash the S&P 500 below 4200?',
      category: 'trending' as const,
      yesPercent: '45',
      noPercent: '55',
      volumeCents: '8900000', // $89k
      endsAt: daysFromNow(60),
      featured: false,
      astroTags: ['mercury', 'retrograde', 'finance'],
    },
    {
      question: 'Will Taylor Swift announce Reputation TV in Feb?',
      category: 'pop_culture' as const,
      yesPercent: '92',
      noPercent: '8',
      volumeCents: '31000000', // $310k
      endsAt: daysFromNow(30),
      featured: false,
      astroTags: ['taylor-swift', 'music'],
    },

    // PERSONAL
    {
      question: 'Will you get back with your ex this month?',
      category: 'personal' as const,
      yesPercent: '78',
      noPercent: '22',
      volumeCents: '1200000', // $12k
      endsAt: daysFromNow(14),
      featured: false,
      astroTags: ['relationships', 'personal'],
    },
    {
      question: 'Will Drake and Rocky squash the beef by March?',
      category: 'pop_culture' as const,
      yesPercent: '15',
      noPercent: '85',
      volumeCents: '5600000', // $56k
      endsAt: daysFromNow(45),
      featured: false,
      astroTags: ['music', 'beef'],
    },

    // CRYPTO / ASTRO
    {
      question: 'Will Bitcoin hit $150k during Jupiter in Cancer?',
      category: 'crypto' as const,
      yesPercent: '67',
      noPercent: '33',
      volumeCents: '45000000', // $450k
      endsAt: daysFromNow(200),
      featured: false,
      astroTags: ['jupiter', 'cancer', 'crypto', 'bitcoin'],
    },
    {
      question: 'Will Saturn in Aries trigger a major tech layoff wave?',
      category: 'astro' as const,
      yesPercent: '58',
      noPercent: '42',
      volumeCents: '2300000', // $23k
      endsAt: daysFromNow(90),
      featured: false,
      astroTags: ['saturn', 'aries', 'tech', 'career'],
    },
  ];

  await db.insert(predictionMarkets).values(marketData);
  console.log(`✅ Inserted ${marketData.length} prediction markets`);

  // ============================================================================
  // POLLS (require a user for createdBy)
  // ============================================================================

  // First, create a seed user for polls
  await db.delete(pollOptions);
  await db.delete(polls);
  await db.delete(users);

  const [seedUser] = await db.insert(users).values({
    email: 'seed@astra.app',
    isAdmin: true,
    onboardingCompleted: true,
  }).returning();

  const pollData = [
    {
      question: 'Which retrograde hits you the hardest?',
      description: 'We all have that one transit that wrecks us every time.',
      astroTags: ['retrograde', 'transit'],
      featured: true,
      expiresAt: daysFromNow(7),
      createdBy: seedUser.userId,
      options: ['Mercury (communication chaos)', 'Venus (relationship drama)', 'Mars (anger issues)', 'Saturn (reality checks)'],
    },
    {
      question: 'Your toxic trait based on your rising sign?',
      description: null,
      astroTags: ['rising', 'signs'],
      featured: false,
      expiresAt: daysFromNow(14),
      createdBy: seedUser.userId,
      options: ['Saying "I\'m fine" when I\'m not', 'Ghosting instead of confronting', 'Starting fights for fun', 'Overthinking everything'],
    },
    {
      question: 'Best sign to date during Venus in Pisces?',
      description: 'Venus enters Pisces soon. Who are you shooting your shot with?',
      astroTags: ['venus', 'pisces', 'dating'],
      featured: true,
      expiresAt: daysFromNow(30),
      createdBy: seedUser.userId,
      options: ['Water signs (Cancer, Scorpio, Pisces)', 'Earth signs (Taurus, Virgo, Cap)', 'Fire signs (Aries, Leo, Sag)', 'Air signs (Gemini, Libra, Aqua)'],
    },
    {
      question: 'Do you believe in astrology compatibility?',
      description: 'Be honest.',
      astroTags: ['compatibility', 'relationships'],
      featured: false,
      expiresAt: daysFromNow(21),
      createdBy: seedUser.userId,
      options: ['100% - charts don\'t lie', 'Somewhat - it\'s a guide', 'Not really - vibes matter more', 'No - it\'s just entertainment'],
    },
  ];

  for (const poll of pollData) {
    const { options, ...pollValues } = poll;
    const [insertedPoll] = await db.insert(polls).values(pollValues).returning();

    const optionValues = options.map((text, idx) => ({
      pollId: insertedPoll.pollId,
      text,
      displayOrder: idx,
      voteCount: Math.floor(Math.random() * 50) + 5, // Random initial votes for demo
    }));

    await db.insert(pollOptions).values(optionValues);
  }

  console.log(`✅ Inserted ${pollData.length} polls with options`);

  console.log('🌱 Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
