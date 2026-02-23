export type ChatMessage = {
    id: string;
    threadId: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    context?: string;
};

export type ChatSendResponse = {
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
};

export type FeedItem = {
    id: string;
    type: 'personal' | 'tea' | 'prompt' | 'celebrity';
    title: string;
    body: string;
    createdAt: string;
    source: 'human' | 'ai';
    tags?: string[];
};

export type TrendingTopic = {
    id: string;
    label: string;
    volume?: number;
};

export type Market = {
    id: string;
    question: string;
    volume: string;
    yes: number;
    no: number;
    endsIn?: string;
    hot?: boolean;
};

export type MarketPosition = {
    id: string;
    market: string;
    position: 'YES' | 'NO';
    shares: number;
    value: string;
    status: 'up' | 'down';
};

export type MarketsOverview = {
    featured: Market | null;
    active: Market[];
    positions: MarketPosition[];
    balanceCents: number | null;
};

// ============================================================================
// POLLS
// ============================================================================
export type PollOption = {
    id: string;
    text: string;
    voteCount: number;
    percentage: number;
};

export type Poll = {
    id: string;
    question: string;
    description?: string;
    options: PollOption[];
    astroTags?: string[];
    totalVotes: number;
    userVote?: string;
    showResults: boolean;
    featured: boolean;
    expiresAt?: string;
    createdAt: string;
};

export type PollSignBreakdown = {
    [sign: string]: { [optionId: string]: number };
};

// ============================================================================
// DIARY
// ============================================================================
export type DiaryEntry = {
    id: string;
    title: string | null;
    body: string;
    mood: string | null;
    moodTags: string[] | null;
    aiReflection: string | null;
    createdAt: string;
    updatedAt: string | null;
};

// ============================================================================
// RELATIONSHIPS
// ============================================================================
export type CompatibilitySnapshot = {
    summary: string;
    strengths: string[];
    tensions: string[];
    tip: string;
    score: number;
    generatedAt: string;
    version: number;
};

export type Relationship = {
    id: string;
    personName: string;
    label: string;
    type: string;
    sunSign: string | null;
    moonSign: string | null;
    risingSign: string | null;
    compatibilitySnapshot: CompatibilitySnapshot | null;
    lastReadAt: string | null;
    createdAt: string;
};

// ============================================================================
// TAROT
// ============================================================================
export type DrawnCard = {
    cardId: string;
    reversed: boolean;
    position: string;
};

export type TarotPull = {
    id: string;
    spread: string;
    cards: DrawnCard[];
    interpretation: string | null;
    context: string | null;
    createdAt: string;
};
