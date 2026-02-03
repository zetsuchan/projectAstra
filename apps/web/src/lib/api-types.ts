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
    userVote?: string; // optionId if voted
    showResults: boolean;
    featured: boolean;
    expiresAt?: string;
    createdAt: string;
};

export type PollSignBreakdown = {
    [sign: string]: { [optionId: string]: number };
};
