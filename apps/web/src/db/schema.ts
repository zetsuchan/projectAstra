import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  time,
  boolean,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

// ============================================================================
// USERS
// ============================================================================
export const users = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  timezone: text('timezone'),
  personaName: text('persona_name'),
  personaStyle: text('persona_style'),
  diaryCadence: text('diary_cadence').$type<'daily' | 'weekly' | 'off'>(),
  settings: jsonb('settings').$type<{ privacyToggles?: Record<string, boolean> }>(),
});

// ============================================================================
// CHARTS
// ============================================================================
export const charts = pgTable('charts', {
  chartId: uuid('chart_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.userId).notNull(),
  birthDate: date('birth_date').notNull(),
  birthTime: time('birth_time'),
  birthTimePrecision: text('birth_time_precision').$type<'exact' | 'approximate' | 'unknown'>(),
  birthLocation: text('birth_location'),
  sunSign: text('sun_sign').notNull(),
  moonSign: text('moon_sign'),
  risingSign: text('rising_sign'),
  rawChartPayload: jsonb('raw_chart_payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// RELATIONSHIPS
// ============================================================================
export const relationships = pgTable(
  'relationships',
  {
    relationshipId: uuid('relationship_id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.userId).notNull(),
    label: text('label').notNull(),
    type: text('type').$type<'boyfriend' | 'best_friend' | 'situationship' | 'custom'>().notNull(),
    personName: text('person_name').notNull(),
    chartId: uuid('chart_id').references(() => charts.chartId),
    sunSign: text('sun_sign'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('relationships_user_id_idx').on(table.userId)]
);

// ============================================================================
// CHAT THREADS
// ============================================================================
export const chatThreads = pgTable('chat_threads', {
  threadId: uuid('thread_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.userId).notNull(),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  memoryEnabled: boolean('memory_enabled').default(true),
  summary: text('summary'),
});

// ============================================================================
// CHAT MESSAGES
// ============================================================================
export const chatMessages = pgTable(
  'chat_messages',
  {
    messageId: uuid('message_id').primaryKey().defaultRandom(),
    threadId: uuid('thread_id').references(() => chatThreads.threadId).notNull(),
    userId: uuid('user_id').references(() => users.userId).notNull(),
    role: text('role').$type<'user' | 'assistant'>().notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('chat_messages_thread_created_idx').on(table.threadId, table.createdAt)]
);

// ============================================================================
// DIARY ENTRIES
// ============================================================================
export const diaryEntries = pgTable(
  'diary_entries',
  {
    entryId: uuid('entry_id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.userId).notNull(),
    title: text('title'),
    body: text('body').notNull(),
    mood: text('mood'),
    promptId: uuid('prompt_id').references(() => prompts.promptId),
    astroTags: jsonb('astro_tags').$type<string[]>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('diary_entries_user_created_idx').on(table.userId, table.createdAt)]
);

// ============================================================================
// FEED ITEMS
// ============================================================================
export const feedItems = pgTable(
  'feed_items',
  {
    feedId: uuid('feed_id').primaryKey().defaultRandom(),
    type: text('type').$type<'personal' | 'tea' | 'prompt' | 'celebrity'>().notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    tags: jsonb('tags').$type<string[]>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at'),
    source: text('source').$type<'human' | 'ai'>().notNull(),
  },
  (table) => [index('feed_items_created_type_idx').on(table.createdAt, table.type)]
);

// ============================================================================
// FEED SAVES
// ============================================================================
export const feedSaves = pgTable('feed_saves', {
  saveId: uuid('save_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.userId).notNull(),
  feedId: uuid('feed_id').references(() => feedItems.feedId).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// TAROT PULLS
// ============================================================================
export const tarotPulls = pgTable('tarot_pulls', {
  pullId: uuid('pull_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.userId).notNull(),
  cardId: text('card_id').notNull(),
  interpretation: text('interpretation').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// PROMPTS
// ============================================================================
export const prompts = pgTable('prompts', {
  promptId: uuid('prompt_id').primaryKey().defaultRandom(),
  type: text('type').$type<'daily' | 'weekly'>().notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// MEMORIES (optional Phase 1)
// ============================================================================
export const memories = pgTable('memories', {
  memoryId: uuid('memory_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.userId).notNull(),
  summary: text('summary').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// PREDICTION MARKETS
// ============================================================================
export const predictionMarkets = pgTable(
  'prediction_markets',
  {
    marketId: uuid('market_id').primaryKey().defaultRandom(),
    question: text('question').notNull(),
    category: text('category').$type<'trending' | 'pop_culture' | 'personal' | 'crypto' | 'astro'>().notNull(),
    yesPercent: text('yes_percent').notNull(), // stored as string like "12%"
    noPercent: text('no_percent').notNull(),
    volumeCents: text('volume_cents').notNull(), // e.g. "14200000" for $142k
    endsAt: timestamp('ends_at').notNull(),
    featured: boolean('featured').default(false),
    resolved: boolean('resolved').default(false),
    resolution: text('resolution').$type<'yes' | 'no' | null>(),
    astroTags: jsonb('astro_tags').$type<string[]>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('prediction_markets_category_idx').on(table.category)]
);
