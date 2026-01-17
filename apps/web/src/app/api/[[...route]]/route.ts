import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { feedItems, predictionMarkets } from '@/db/schema';
import type { ChatMessage, MarketsOverview, TrendingTopic } from '@/lib/api-types';

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

app.get('/feed', async (c) => {
    const items = await db
        .select()
        .from(feedItems)
        .orderBy(desc(feedItems.createdAt))
        .limit(20);

    return c.json({
        items: items.map((item) => ({
            id: item.feedId,
            type: item.type,
            title: item.title,
            body: item.body,
            tags: item.tags,
            source: item.source,
            createdAt: item.createdAt.toISOString(),
        })),
    });
});

app.get('/feed/trending', async (c) => {
    // Extract unique tags from recent feed items as trending topics
    const recentItems = await db
        .select()
        .from(feedItems)
        .orderBy(desc(feedItems.createdAt))
        .limit(10);

    const tagCounts = new Map<string, number>();
    for (const item of recentItems) {
        const tags = item.tags as string[] | null;
        if (tags) {
            for (const tag of tags) {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            }
        }
    }

    const topics: TrendingTopic[] = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));

    return c.json({ topics });
});

app.get('/markets/overview', async (c) => {
    const markets = await db
        .select()
        .from(predictionMarkets)
        .orderBy(desc(predictionMarkets.createdAt));

    const featured = markets.find((m) => m.featured);
    const active = markets.filter((m) => !m.resolved);

    const formatMarket = (m: typeof markets[0]) => ({
        id: m.marketId,
        question: m.question,
        category: m.category,
        yesPercent: m.yesPercent,
        noPercent: m.noPercent,
        volume: formatVolume(m.volumeCents),
        endsAt: m.endsAt.toISOString(),
        featured: m.featured,
        astroTags: m.astroTags,
    });

    const overview: MarketsOverview = {
        featured: featured ? formatMarket(featured) : null,
        active: active.map(formatMarket),
        positions: [], // TODO: user positions when auth is added
        balanceCents: null, // TODO: user balance when auth is added
    };

    return c.json(overview);
});

function formatVolume(cents: string): string {
    const num = parseInt(cents, 10);
    const dollars = num / 100;
    if (dollars >= 1_000_000) {
        return `$${(dollars / 1_000_000).toFixed(1)}M`;
    }
    if (dollars >= 1_000) {
        return `$${Math.round(dollars / 1_000)}k`;
    }
    return `$${Math.round(dollars)}`;
}

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
