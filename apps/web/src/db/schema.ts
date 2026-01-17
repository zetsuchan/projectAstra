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
  bigint,
  integer,
} from 'drizzle-orm/pg-core';

// ============================================================================
// USERS
// ============================================================================
export const users = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  privyId: text('privy_id').unique(), // Links Privy auth to our user
  email: text('email'),
  walletAddress: text('wallet_address'), // Primary Solana wallet
  createdAt: timestamp('created_at').defaultNow().notNull(),
  timezone: text('timezone'),
  personaName: text('persona_name'),
  personaStyle: text('persona_style'),
  diaryCadence: text('diary_cadence').$type<'daily' | 'weekly' | 'off'>(),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  settings: jsonb('settings').$type<{ privacyToggles?: Record<string, boolean> }>(),
  // Points system (cached balance for performance)
  pointsBalance: integer('points_balance').default(0).notNull(),
  pointsUpdatedAt: timestamp('points_updated_at').defaultNow(),
  dailyBonusLastClaimedAt: timestamp('daily_bonus_last_claimed_at'),
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

// ============================================================================
// MARKET POSITIONS (User bets on prediction markets)
// ============================================================================
export const marketPositions = pgTable(
  'market_positions',
  {
    positionId: uuid('position_id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.userId).notNull(),
    marketId: uuid('market_id').references(() => predictionMarkets.marketId).notNull(),
    side: text('side').$type<'yes' | 'no'>().notNull(),
    amountLamports: bigint('amount_lamports', { mode: 'number' }), // SOL amount (1 SOL = 1B lamports)
    amountPoints: integer('amount_points'), // Points amount (alternative to SOL)
    shares: integer('shares').notNull(), // Number of shares purchased
    avgPrice: integer('avg_price_cents').notNull(), // Average price paid per share in cents
    txSignature: text('tx_signature'), // Solana transaction signature
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('market_positions_user_idx').on(table.userId),
    index('market_positions_market_idx').on(table.marketId),
  ]
);

// ============================================================================
// POINT TRANSACTIONS (Append-only ledger for audit trail)
// ============================================================================
export const pointTransactions = pgTable(
  'point_transactions',
  {
    transactionId: uuid('transaction_id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.userId).notNull(),
    // Core transaction data
    amount: integer('amount').notNull(), // Positive for credits, negative for debits
    type: text('type').$type<
      'signup_bonus' |
      'daily_bonus' |
      'market_win' |
      'market_bet' |
      'referral_bonus' |
      'transfer_in' |
      'transfer_out' |
      'admin_adjustment'
    >().notNull(),
    // Snapshot of balance after this transaction
    balanceAfter: integer('balance_after').notNull(),
    // Details
    description: text('description'),
    metadata: jsonb('metadata').$type<{
      marketId?: string;
      toUserId?: string;
      fromUserId?: string;
      relatedTransactionId?: string;
      ipAddress?: string;
      adminUserId?: string;
    }>(),
    // Idempotency (prevents duplicate transactions on retry)
    idempotencyKey: text('idempotency_key').unique(),
    // Audit trail
    createdAt: timestamp('created_at').defaultNow().notNull(),
    // Reversal support (never delete, only reverse)
    reversedAt: timestamp('reversed_at'),
    reversalTransactionId: uuid('reversal_transaction_id'),
  },
  (table) => [
    index('point_tx_user_created_idx').on(table.userId, table.createdAt),
    index('point_tx_type_idx').on(table.type),
    index('point_tx_idempotency_idx').on(table.idempotencyKey),
  ]
);

// ============================================================================
// FRAUD ATTEMPTS (Logging for security analysis)
// ============================================================================
export const fraudAttempts = pgTable(
  'fraud_attempts',
  {
    attemptId: uuid('attempt_id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.userId).notNull(),
    reason: text('reason').$type<
      'rate_limit_exceeded' |
      'multi_accounting_suspected' |
      'unusual_amount' |
      'insufficient_balance' |
      'suspicious_pattern'
    >().notNull(),
    action: text('action').notNull(), // What they tried to do
    metadata: jsonb('metadata').$type<{
      ipAddress?: string;
      userAgent?: string;
      amount?: number;
      relatedUserIds?: string[];
    }>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('fraud_attempts_user_idx').on(table.userId),
    index('fraud_attempts_created_idx').on(table.createdAt),
  ]
);
