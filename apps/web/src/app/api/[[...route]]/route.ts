import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import type { ChatMessage, FeedItem, MarketsOverview, TrendingTopic } from '@/lib/api-types';

const app = new Hono().basePath('/api');
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';

const getOpenRouterHeaders = () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return null;
    }

    return {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_APP_TITLE ?? 'Project Astra',
    };
};

const requestAssistantReply = async (content: string) => {
    const headers = getOpenRouterHeaders();
    if (!headers) {
        return { error: 'missing_openrouter_key' } as const;
    }

    const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
            messages: [{ role: 'user', content }],
        }),
    });

    if (!res.ok) {
        return { error: 'openrouter_error' } as const;
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply || typeof reply !== 'string') {
        return { error: 'empty_response' } as const;
    }

    return { reply } as const;
};

app.get('/health', (c) => {
    return c.json({ ok: true });
});

app.get('/feed', (c) => {
    const items: FeedItem[] = [];
    return c.json({ items });
});

app.get('/feed/trending', (c) => {
    const topics: TrendingTopic[] = [];
    return c.json({ topics });
});

app.get('/markets/overview', (c) => {
    const overview: MarketsOverview = {
        featured: null,
        active: [],
        positions: [],
        balanceCents: null,
    };

    return c.json(overview);
});

app.get('/chat/threads/:threadId/messages', (c) => {
    const messages: ChatMessage[] = [];
    return c.json({ messages });
});

app.post('/chat/threads/:threadId/messages', async (c) => {
    let payload: { content?: string } | null = null;

    try {
        payload = await c.req.json();
    } catch {
        payload = null;
    }

    if (!payload?.content || !payload.content.trim()) {
        return c.json({ error: 'content_required' }, 400);
    }

    const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        threadId: c.req.param('threadId'),
        role: 'user',
        content: payload.content.trim(),
        createdAt: new Date().toISOString(),
    };

    const assistantReply = await requestAssistantReply(userMessage.content);

    if ('error' in assistantReply) {
        return c.json({ error: assistantReply.error }, 502);
    }

    const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        threadId: userMessage.threadId,
        role: 'assistant',
        content: assistantReply.reply,
        createdAt: new Date().toISOString(),
    };

    return c.json({ userMessage, assistantMessage }, 201);
});

export const runtime = 'nodejs';

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
