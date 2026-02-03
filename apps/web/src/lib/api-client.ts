import type { ChatMessage, ChatSendResponse, FeedItem, MarketsOverview, TrendingTopic, Poll, PollSignBreakdown } from './api-types';
import { DEFAULT_THREAD_ID } from './chat-constants';

const JSON_HEADERS = {
    'Content-Type': 'application/json',
};

export { DEFAULT_THREAD_ID };

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

export async function sendChatMessage(
    threadId: string,
    content: string,
    fetcher: typeof fetch = fetch
): Promise<ChatSendResponse | null> {
    try {
        const res = await fetcher(`/api/chat/threads/${threadId}/messages`, {
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

// ============================================================================
// POLLS
// ============================================================================

export async function fetchPolls(fetcher: typeof fetch = fetch): Promise<Poll[]> {
    try {
        const res = await fetcher('/api/polls', { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.polls) ? data.polls : [];
    } catch {
        return [];
    }
}

export async function fetchPoll(pollId: string, fetcher: typeof fetch = fetch): Promise<Poll | null> {
    try {
        const res = await fetcher(`/api/polls/${pollId}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.poll ?? null;
    } catch {
        return null;
    }
}

export async function votePoll(
    pollId: string,
    optionId: string,
    idempotencyKey?: string,
    fetcher: typeof fetch = fetch
): Promise<{ success: boolean; error?: string; optionId?: string }> {
    try {
        const res = await fetcher(`/api/polls/${pollId}/vote`, {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ optionId, idempotencyKey }),
        });

        const data = await res.json();

        if (!res.ok) {
            return { success: false, error: data?.error ?? 'vote_failed' };
        }

        return { success: true, optionId: data?.optionId };
    } catch {
        return { success: false, error: 'network_error' };
    }
}

export async function fetchPollSignBreakdown(
    pollId: string,
    fetcher: typeof fetch = fetch
): Promise<PollSignBreakdown | null> {
    try {
        const res = await fetcher(`/api/polls/${pollId}/signs`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.breakdown ?? null;
    } catch {
        return null;
    }
}
