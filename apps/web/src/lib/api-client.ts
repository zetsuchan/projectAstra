import type { ChatMessage, ChatSendResponse, FeedItem, MarketsOverview, TrendingTopic } from './api-types';

const JSON_HEADERS = {
    'Content-Type': 'application/json',
};

export const DEFAULT_THREAD_ID = '00000000-0000-0000-0000-000000000000';

export async function fetchChatMessages(threadId: string): Promise<ChatMessage[]> {
    try {
        const res = await fetch(`/api/chat/threads/${threadId}/messages`, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.messages) ? data.messages : [];
    } catch {
        return [];
    }
}

export async function sendChatMessage(threadId: string, content: string): Promise<ChatSendResponse | null> {
    try {
        const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ content }),
        });

        if (!res.ok) return null;
        const data = await res.json();
        if (!data?.assistantMessage) {
            return null;
        }
        return data as ChatSendResponse;
    } catch {
        return null;
    }
}

export async function fetchFeedItems(): Promise<FeedItem[]> {
    try {
        const res = await fetch('/api/feed', { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.items) ? data.items : [];
    } catch {
        return [];
    }
}

export async function fetchTrendingTopics(): Promise<TrendingTopic[]> {
    try {
        const res = await fetch('/api/feed/trending', { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.topics) ? data.topics : [];
    } catch {
        return [];
    }
}

export async function fetchMarketsOverview(): Promise<MarketsOverview> {
    const fallback: MarketsOverview = {
        featured: null,
        active: [],
        positions: [],
        balanceCents: null,
    };

    try {
        const res = await fetch('/api/markets/overview', { cache: 'no-store' });
        if (!res.ok) return fallback;
        const data = await res.json();
        return {
            featured: data?.featured ?? null,
            active: Array.isArray(data?.active) ? data.active : [],
            positions: Array.isArray(data?.positions) ? data.positions : [],
            balanceCents: typeof data?.balanceCents === 'number' ? data.balanceCents : null,
        };
    } catch {
        return fallback;
    }
}
