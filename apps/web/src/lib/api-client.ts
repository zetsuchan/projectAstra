import type {
    ChatMessage, FeedItem, MarketsOverview, TrendingTopic,
    Poll, PollSignBreakdown, DiaryEntry, Relationship, TarotPull,
} from './api-types';
import { DEFAULT_THREAD_ID } from './chat-constants';

const JSON_HEADERS = {
    'Content-Type': 'application/json',
};

export { DEFAULT_THREAD_ID };

// ============================================================================
// CHAT
// ============================================================================

export async function fetchChatMessages(
    threadId: string,
    fetcher: typeof fetch = fetch,
): Promise<ChatMessage[]> {
    if (threadId === DEFAULT_THREAD_ID) return [];
    try {
        const res = await fetcher(`/api/chat/threads/${threadId}/messages`, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.messages) ? data.messages : [];
    } catch {
        return [];
    }
}

export async function sendChatMessageStream(
    threadId: string,
    content: string,
    onChunk: (text: string) => void,
    fetcher: typeof fetch = fetch,
): Promise<{ threadId: string; userMessageId: string } | null> {
    try {
        const res = await fetcher(`/api/chat/threads/${threadId}/messages`, {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ content }),
        });

        if (!res.ok) return null;

        const newThreadId = res.headers.get('X-Thread-Id') ?? threadId;
        const userMessageId = res.headers.get('X-User-Message-Id') ?? '';

        if (!res.body) return null;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }

        return { threadId: newThreadId, userMessageId };
    } catch {
        return null;
    }
}

// Legacy non-streaming fallback
export async function sendChatMessage(
    threadId: string,
    content: string,
    fetcher: typeof fetch = fetch,
): Promise<{ threadId: string; assistantContent: string; userMessageId: string } | null> {
    let fullText = '';
    const result = await sendChatMessageStream(
        threadId,
        content,
        (chunk) => { fullText += chunk; },
        fetcher,
    );
    if (!result) return null;
    return { ...result, assistantContent: fullText };
}

// ============================================================================
// FEED
// ============================================================================

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
    fetcher: typeof fetch = fetch,
): Promise<{ success: boolean; error?: string; optionId?: string }> {
    try {
        const res = await fetcher(`/api/polls/${pollId}/vote`, {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ optionId, idempotencyKey }),
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data?.error ?? 'vote_failed' };
        return { success: true, optionId: data?.optionId };
    } catch {
        return { success: false, error: 'network_error' };
    }
}

export async function fetchPollSignBreakdown(
    pollId: string,
    fetcher: typeof fetch = fetch,
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

// ============================================================================
// DIARY
// ============================================================================

export async function fetchDiaryEntries(
    cursor?: string,
    limit = 20,
    fetcher: typeof fetch = fetch,
): Promise<{ entries: DiaryEntry[]; nextCursor: string | null }> {
    try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (cursor) params.set('cursor', cursor);
        const res = await fetcher(`/api/diary/entries?${params}`, { cache: 'no-store' });
        if (!res.ok) return { entries: [], nextCursor: null };
        const data = await res.json();
        return {
            entries: Array.isArray(data?.entries) ? data.entries : [],
            nextCursor: data?.nextCursor ?? null,
        };
    } catch {
        return { entries: [], nextCursor: null };
    }
}

export async function fetchDiaryEntry(
    id: string,
    fetcher: typeof fetch = fetch,
): Promise<DiaryEntry | null> {
    try {
        const res = await fetcher(`/api/diary/entries/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.entry ?? null;
    } catch {
        return null;
    }
}

export async function createDiaryEntry(
    body: string,
    moodTags?: string[],
    title?: string,
    fetcher: typeof fetch = fetch,
): Promise<DiaryEntry | null> {
    try {
        const res = await fetcher('/api/diary/entries', {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ body, moodTags, title }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.entry ?? null;
    } catch {
        return null;
    }
}

export async function updateDiaryEntry(
    id: string,
    updates: { body?: string; title?: string; moodTags?: string[] },
    fetcher: typeof fetch = fetch,
): Promise<DiaryEntry | null> {
    try {
        const res = await fetcher(`/api/diary/entries/${id}`, {
            method: 'PATCH',
            headers: JSON_HEADERS,
            body: JSON.stringify(updates),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.entry ?? null;
    } catch {
        return null;
    }
}

export async function deleteDiaryEntry(
    id: string,
    fetcher: typeof fetch = fetch,
): Promise<boolean> {
    try {
        const res = await fetcher(`/api/diary/entries/${id}`, { method: 'DELETE' });
        return res.ok;
    } catch {
        return false;
    }
}

// ============================================================================
// RELATIONSHIPS
// ============================================================================

export async function fetchRelationships(
    fetcher: typeof fetch = fetch,
): Promise<Relationship[]> {
    try {
        const res = await fetcher('/api/relationships', { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.relationships) ? data.relationships : [];
    } catch {
        return [];
    }
}

export async function fetchRelationship(
    id: string,
    fetcher: typeof fetch = fetch,
): Promise<Relationship | null> {
    try {
        const res = await fetcher(`/api/relationships/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.relationship ?? null;
    } catch {
        return null;
    }
}

export async function createRelationship(
    data: { personName: string; label: string; type: string; sunSign?: string; moonSign?: string; risingSign?: string },
    fetcher: typeof fetch = fetch,
): Promise<Relationship | null> {
    try {
        const res = await fetcher('/api/relationships', {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify(data),
        });
        if (!res.ok) return null;
        const result = await res.json();
        return result?.relationship ?? null;
    } catch {
        return null;
    }
}

export async function updateRelationship(
    id: string,
    updates: { personName?: string; label?: string; type?: string; sunSign?: string; moonSign?: string; risingSign?: string },
    fetcher: typeof fetch = fetch,
): Promise<Relationship | null> {
    try {
        const res = await fetcher(`/api/relationships/${id}`, {
            method: 'PATCH',
            headers: JSON_HEADERS,
            body: JSON.stringify(updates),
        });
        if (!res.ok) return null;
        const result = await res.json();
        return result?.relationship ?? null;
    } catch {
        return null;
    }
}

export async function deleteRelationship(
    id: string,
    fetcher: typeof fetch = fetch,
): Promise<boolean> {
    try {
        const res = await fetcher(`/api/relationships/${id}`, { method: 'DELETE' });
        return res.ok;
    } catch {
        return false;
    }
}

// ============================================================================
// TAROT
// ============================================================================

export async function pullTarot(
    spread: 'single' | 'three-card' = 'single',
    context?: string,
    fetcher: typeof fetch = fetch,
): Promise<{ pull: TarotPull; alreadyPulled: boolean } | null> {
    try {
        const res = await fetcher('/api/tarot/pull', {
            method: 'POST',
            headers: JSON_HEADERS,
            body: JSON.stringify({ spread, context }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data ?? null;
    } catch {
        return null;
    }
}

export async function fetchTarotPulls(
    fetcher: typeof fetch = fetch,
): Promise<TarotPull[]> {
    try {
        const res = await fetcher('/api/tarot/pulls', { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.pulls) ? data.pulls : [];
    } catch {
        return [];
    }
}

export async function reinterpretTarot(
    pullId: string,
    fetcher: typeof fetch = fetch,
): Promise<TarotPull | null> {
    try {
        const res = await fetcher(`/api/tarot/pulls/${pullId}/reinterpret`, {
            method: 'POST',
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.pull ?? null;
    } catch {
        return null;
    }
}
