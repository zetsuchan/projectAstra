import { Hono } from 'hono';
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { desc, eq, and, isNull, or, sql, inArray, gt, asc, lt } from 'drizzle-orm';
import { db } from '@/db';
import {
  feedItems, predictionMarkets, chatThreads, chatMessages, users, charts,
  polls, pollOptions, pollVotes, diaryEntries, relationships, tarotPulls,
} from '@/db/schema';
import type {
  ChatMessage, MarketsOverview, TrendingTopic, Poll, PollOption, PollSignBreakdown,
  DiaryEntry, Relationship, TarotPull,
} from '@/lib/api-types';
import { buildUserContextPrompt } from '@/lib/context-builder';
import { LUMI_SYSTEM_PROMPT } from '@/lib/system-prompt';
import { verifyAuthToken, type AuthenticatedUser } from '@/lib/auth-server';
import { DEFAULT_THREAD_ID } from '@/lib/chat-constants';
import { triggerPollVote } from '@/lib/pusher';

export const app = new Hono().basePath('/api');

const DEFAULT_MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';

const getOpenRouter = () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;
    return createOpenRouter({ apiKey });
};

type MessageRole = 'system' | 'user' | 'assistant';
type Message = { role: MessageRole; content: string };

const requestAssistantReply = async (messages: Message[]) => {
    const openrouter = getOpenRouter();
    if (!openrouter) {
        return { error: 'missing_openrouter_key' } as const;
    }

    try {
        const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
        const result = streamText({
            model: openrouter(model),
            messages,
        });

        let text = '';
        for await (const chunk of (await result).textStream) {
            text += chunk;
        }

        if (!text) {
            return { error: 'empty_response' } as const;
        }
        return { reply: text } as const;
    } catch {
        return { error: 'openrouter_error' } as const;
    }
};

app.get('/health', (c) => {
    return c.json({ ok: true });
});

// ============================================================================
// AUTH
// ============================================================================

app.post('/auth/sync', async (c) => {
    let payload: { privyId?: string; email?: string; walletAddress?: string } | null = null;

    try {
        payload = await c.req.json();
    } catch {
        return c.json({ error: 'invalid_json' }, 400);
    }

    if (!payload?.privyId) {
        return c.json({ error: 'privy_id_required' }, 400);
    }

    const { privyId, email, walletAddress } = payload;

    const existingUser = await db.query.users.findFirst({
        where: eq(users.privyId, privyId),
    });

    if (existingUser) {
        const [updated] = await db
            .update(users)
            .set({
                email: email ?? existingUser.email,
                walletAddress: walletAddress ?? existingUser.walletAddress,
            })
            .where(eq(users.privyId, privyId))
            .returning();

        return c.json({ user: updated, created: false });
    }

    const [newUser] = await db
        .insert(users)
        .values({
            privyId,
            email: email ?? null,
            walletAddress: walletAddress ?? null,
        })
        .returning();

    return c.json({ user: newUser, created: true }, 201);
});

// ============================================================================
// ONBOARDING
// ============================================================================

app.get('/me', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const user = await db.query.users.findFirst({
        where: eq(users.userId, authUser.userId),
    });

    if (!user) {
        return c.json({ error: 'user_not_found' }, 404);
    }

    const chart = await db.query.charts.findFirst({
        where: eq(charts.userId, authUser.userId),
    });

    return c.json({
        userId: user.userId,
        onboardingCompleted: user.onboardingCompleted,
        chart: chart ? {
            sunSign: chart.sunSign,
            moonSign: chart.moonSign,
            risingSign: chart.risingSign,
            birthDate: chart.birthDate,
        } : null,
    });
});

app.post('/onboarding/chart', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    let payload: {
        birthDate?: string;
        birthTime?: string;
        birthTimePrecision?: 'exact' | 'approximate' | 'unknown';
        birthLocation?: string;
        sunSign?: string;
        moonSign?: string;
        risingSign?: string;
    } | null = null;

    try {
        payload = await c.req.json();
    } catch {
        return c.json({ error: 'invalid_json' }, 400);
    }

    if (!payload?.sunSign) {
        return c.json({ error: 'sun_sign_required' }, 400);
    }

    const existingChart = await db.query.charts.findFirst({
        where: eq(charts.userId, authUser.userId),
    });

    if (existingChart) {
        await db
            .update(charts)
            .set({
                birthDate: payload.birthDate ?? existingChart.birthDate,
                birthTime: payload.birthTime ?? existingChart.birthTime,
                birthTimePrecision: payload.birthTimePrecision ?? existingChart.birthTimePrecision,
                birthLocation: payload.birthLocation ?? existingChart.birthLocation,
                sunSign: payload.sunSign,
                moonSign: payload.moonSign ?? existingChart.moonSign,
                risingSign: payload.risingSign ?? existingChart.risingSign,
            })
            .where(eq(charts.chartId, existingChart.chartId));
    } else {
        await db.insert(charts).values({
            userId: authUser.userId,
            birthDate: payload.birthDate ?? new Date().toISOString().split('T')[0],
            birthTime: payload.birthTime ?? null,
            birthTimePrecision: payload.birthTimePrecision ?? 'unknown',
            birthLocation: payload.birthLocation ?? null,
            sunSign: payload.sunSign,
            moonSign: payload.moonSign ?? null,
            risingSign: payload.risingSign ?? null,
        });
    }

    await db
        .update(users)
        .set({ onboardingCompleted: true })
        .where(eq(users.userId, authUser.userId));

    return c.json({ success: true });
});

// ============================================================================
// FEED
// ============================================================================

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
        .map(([tag, count]) => ({ id: tag, label: `#${tag}`, volume: count }));

    return c.json({ topics });
});

// ============================================================================
// MARKETS
// ============================================================================

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
        volume: formatVolume(m.volumeCents),
        yes: parseInt(m.yesPercent, 10),
        no: parseInt(m.noPercent, 10),
        endsIn: formatEndsIn(m.endsAt),
        hot: parseInt(m.volumeCents, 10) > 10_000_000,
    });

    const overview: MarketsOverview = {
        featured: featured ? formatMarket(featured) : null,
        active: active.map(formatMarket),
        positions: [],
        balanceCents: null,
    };

    return c.json(overview);
});

function formatVolume(cents: string): string {
    const num = parseInt(cents, 10);
    const dollars = num / 100;
    if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
    if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}k`;
    return `$${Math.round(dollars)}`;
}

function formatEndsIn(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    if (diffMs <= 0) return 'Ended';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}D ${hours}H`;
    return `${hours}H`;
}

// ============================================================================
// CHAT (with persistence + streaming)
// ============================================================================

app.get('/chat/threads/:threadId/messages', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const threadId = c.req.param('threadId');

    // For default thread ID, look up or return empty
    if (threadId === DEFAULT_THREAD_ID) {
        return c.json({ messages: [] });
    }

    // Verify thread belongs to user
    const thread = await db.query.chatThreads.findFirst({
        where: and(eq(chatThreads.threadId, threadId), eq(chatThreads.userId, authUser.userId)),
    });

    if (!thread) {
        return c.json({ error: 'thread_not_found' }, 404);
    }

    const msgs = await db
        .select()
        .from(chatMessages)
        .where(and(eq(chatMessages.threadId, threadId), eq(chatMessages.userId, authUser.userId)))
        .orderBy(asc(chatMessages.createdAt))
        .limit(100);

    const messages: ChatMessage[] = msgs.map((m) => ({
        id: m.messageId,
        threadId: m.threadId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
    }));

    return c.json({ messages });
});

app.post('/chat/threads/:threadId/messages', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    let payload: { content?: string } | null = null;
    try {
        payload = await c.req.json();
    } catch {
        payload = null;
    }

    if (!payload?.content || !payload.content.trim()) {
        return c.json({ error: 'content_required' }, 400);
    }

    let threadId = c.req.param('threadId');
    const content = payload.content.trim();

    // Auto-create thread if using default thread ID
    if (threadId === DEFAULT_THREAD_ID) {
        const [newThread] = await db
            .insert(chatThreads)
            .values({
                userId: authUser.userId,
                title: null,
            })
            .returning();
        threadId = newThread.threadId;
    } else {
        // Verify thread belongs to user
        const thread = await db.query.chatThreads.findFirst({
            where: and(eq(chatThreads.threadId, threadId), eq(chatThreads.userId, authUser.userId)),
        });
        if (!thread) {
            return c.json({ error: 'thread_not_found' }, 404);
        }
    }

    // Save user message BEFORE calling LLM
    const [savedUserMsg] = await db
        .insert(chatMessages)
        .values({
            threadId,
            userId: authUser.userId,
            role: 'user',
            content,
        })
        .returning();

    // Load last 20 messages as conversation history
    const history = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.threadId, threadId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(20);

    // Build messages array (oldest first)
    const llmMessages: Message[] = [
        { role: 'system', content: LUMI_SYSTEM_PROMPT },
    ];

    const userContext = await buildUserContextPrompt(authUser.userId, threadId);
    if (userContext) {
        llmMessages.push({ role: 'system', content: userContext });
    }

    // Add history in chronological order
    for (const msg of history.reverse()) {
        llmMessages.push({ role: msg.role as MessageRole, content: msg.content });
    }

    // Stream the response using AI SDK
    const openrouter = getOpenRouter();
    if (!openrouter) {
        return c.json({ error: 'missing_openrouter_key' }, 502);
    }

    const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

    try {
        const result = streamText({
            model: openrouter(model),
            messages: llmMessages,
            async onFinish({ text }) {
                // Save assistant message to DB
                await db.insert(chatMessages).values({
                    threadId,
                    userId: authUser.userId,
                    role: 'assistant',
                    content: text,
                });

                // Update thread timestamp
                await db
                    .update(chatThreads)
                    .set({ updatedAt: new Date() })
                    .where(eq(chatThreads.threadId, threadId));

                // Fire-and-forget: generate thread title after 2nd message
                const msgCount = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(chatMessages)
                    .where(eq(chatMessages.threadId, threadId));

                if (msgCount[0]?.count === 3) {
                    // 2 user + 1 assistant = generate title
                    generateThreadTitle(threadId, content, text, openrouter, model).catch(() => {});
                }
            },
        });

        // Consume stream for disconnect safety
        result.consumeStream();

        // Return streaming response with threadId header
        const response = result.toTextStreamResponse();
        response.headers.set('X-Thread-Id', threadId);
        response.headers.set('X-User-Message-Id', savedUserMsg.messageId);
        return response;
    } catch {
        return c.json({ error: 'stream_error' }, 502);
    }
});

async function generateThreadTitle(
    threadId: string,
    userMsg: string,
    assistantMsg: string,
    openrouter: ReturnType<typeof createOpenRouter>,
    model: string,
) {
    try {
        const result = streamText({
            model: openrouter(model),
            messages: [
                { role: 'system', content: 'Generate a short (3-6 word) title for this chat conversation. Reply with ONLY the title, no quotes or extra text.' },
                { role: 'user', content: userMsg },
                { role: 'assistant', content: assistantMsg },
                { role: 'user', content: 'Generate a title for our conversation.' },
            ],
        });

        let title = '';
        for await (const chunk of (await result).textStream) {
            title += chunk;
        }

        title = title.trim().replace(/^["']|["']$/g, '');
        if (title && title.length < 80) {
            await db
                .update(chatThreads)
                .set({ title })
                .where(eq(chatThreads.threadId, threadId));
        }
    } catch {
        // Silently fail — title generation is non-critical
    }
}

// ============================================================================
// DIARY
// ============================================================================

app.get('/diary/entries', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const limit = Math.min(parseInt(c.req.query('limit') ?? '20', 10) || 20, 50);
    const cursor = c.req.query('cursor');

    let cursorDate: Date | null = null;
    let cursorId: string | null = null;

    if (cursor) {
        try {
            const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString());
            cursorDate = new Date(decoded.d);
            cursorId = decoded.id;
        } catch {
            return c.json({ error: 'invalid_cursor' }, 400);
        }
    }

    const conditions = [eq(diaryEntries.userId, authUser.userId)];

    if (cursorDate && cursorId) {
        conditions.push(
            or(
                lt(diaryEntries.createdAt, cursorDate),
                and(eq(diaryEntries.createdAt, cursorDate), lt(diaryEntries.entryId, cursorId))
            )!
        );
    }

    const entries = await db
        .select()
        .from(diaryEntries)
        .where(and(...conditions))
        .orderBy(desc(diaryEntries.createdAt), desc(diaryEntries.entryId))
        .limit(limit + 1);

    const hasMore = entries.length > limit;
    const page = hasMore ? entries.slice(0, limit) : entries;

    let nextCursor: string | null = null;
    if (hasMore) {
        const last = page[page.length - 1];
        nextCursor = Buffer.from(JSON.stringify({ d: last.createdAt.toISOString(), id: last.entryId })).toString('base64url');
    }

    const items: DiaryEntry[] = page.map((e) => ({
        id: e.entryId,
        title: e.title,
        body: e.body,
        mood: e.mood,
        moodTags: e.moodTags as string[] | null,
        aiReflection: e.aiReflection,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt?.toISOString() ?? null,
    }));

    return c.json({ entries: items, nextCursor });
});

app.post('/diary/entries', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    let payload: { body?: string; title?: string; moodTags?: string[] } | null = null;
    try {
        payload = await c.req.json();
    } catch {
        return c.json({ error: 'invalid_json' }, 400);
    }

    if (!payload?.body || !payload.body.trim()) {
        return c.json({ error: 'body_required' }, 400);
    }

    const [entry] = await db
        .insert(diaryEntries)
        .values({
            userId: authUser.userId,
            body: payload.body.trim(),
            title: payload.title?.trim() || null,
            mood: payload.moodTags?.[0] ?? null,
            moodTags: payload.moodTags ?? null,
        })
        .returning();

    // Fire-and-forget AI reflection
    generateDiaryReflection(entry.entryId, payload.body.trim(), authUser.userId).catch(() => {});

    const result: DiaryEntry = {
        id: entry.entryId,
        title: entry.title,
        body: entry.body,
        mood: entry.mood,
        moodTags: entry.moodTags as string[] | null,
        aiReflection: null,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt?.toISOString() ?? null,
    };

    return c.json({ entry: result }, 201);
});

app.get('/diary/entries/:id', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const entryId = c.req.param('id');
    const entry = await db.query.diaryEntries.findFirst({
        where: and(eq(diaryEntries.entryId, entryId), eq(diaryEntries.userId, authUser.userId)),
    });

    if (!entry) {
        return c.json({ error: 'not_found' }, 404);
    }

    const result: DiaryEntry = {
        id: entry.entryId,
        title: entry.title,
        body: entry.body,
        mood: entry.mood,
        moodTags: entry.moodTags as string[] | null,
        aiReflection: entry.aiReflection,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt?.toISOString() ?? null,
    };

    return c.json({ entry: result });
});

app.patch('/diary/entries/:id', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const entryId = c.req.param('id');
    let payload: { body?: string; title?: string; moodTags?: string[] } | null = null;
    try {
        payload = await c.req.json();
    } catch {
        return c.json({ error: 'invalid_json' }, 400);
    }

    const existing = await db.query.diaryEntries.findFirst({
        where: and(eq(diaryEntries.entryId, entryId), eq(diaryEntries.userId, authUser.userId)),
    });

    if (!existing) {
        return c.json({ error: 'not_found' }, 404);
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (payload?.body !== undefined) updates.body = payload.body.trim();
    if (payload?.title !== undefined) updates.title = payload.title?.trim() || null;
    if (payload?.moodTags !== undefined) {
        updates.moodTags = payload.moodTags;
        updates.mood = payload.moodTags?.[0] ?? null;
    }

    const [updated] = await db
        .update(diaryEntries)
        .set(updates)
        .where(eq(diaryEntries.entryId, entryId))
        .returning();

    const result: DiaryEntry = {
        id: updated.entryId,
        title: updated.title,
        body: updated.body,
        mood: updated.mood,
        moodTags: updated.moodTags as string[] | null,
        aiReflection: updated.aiReflection,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt?.toISOString() ?? null,
    };

    return c.json({ entry: result });
});

app.delete('/diary/entries/:id', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const entryId = c.req.param('id');
    const existing = await db.query.diaryEntries.findFirst({
        where: and(eq(diaryEntries.entryId, entryId), eq(diaryEntries.userId, authUser.userId)),
    });

    if (!existing) {
        return c.json({ error: 'not_found' }, 404);
    }

    await db.delete(diaryEntries).where(eq(diaryEntries.entryId, entryId));
    return c.json({ success: true });
});

async function generateDiaryReflection(entryId: string, body: string, userId: string) {
    const openrouter = getOpenRouter();
    if (!openrouter) return;

    const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
    const userContext = await buildUserContextPrompt(userId);

    const messages: Message[] = [
        { role: 'system', content: LUMI_SYSTEM_PROMPT },
    ];
    if (userContext) {
        messages.push({ role: 'system', content: userContext });
    }
    messages.push({
        role: 'user',
        content: `The user just wrote this diary entry. Write a brief, warm reflection (2-3 sentences) connecting it to their astrological context if relevant. Be supportive and insightful, not generic. Diary entry:\n\n${body}`,
    });

    try {
        const result = streamText({
            model: openrouter(model),
            messages,
        });

        let reflection = '';
        for await (const chunk of (await result).textStream) {
            reflection += chunk;
        }

        if (reflection.trim()) {
            await db
                .update(diaryEntries)
                .set({ aiReflection: reflection.trim() })
                .where(eq(diaryEntries.entryId, entryId));
        }
    } catch {
        // Non-critical failure
    }
}

// ============================================================================
// RELATIONSHIPS
// ============================================================================

app.get('/relationships', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const rels = await db
        .select()
        .from(relationships)
        .where(eq(relationships.userId, authUser.userId))
        .orderBy(desc(relationships.createdAt));

    const items: Relationship[] = rels.map((r) => ({
        id: r.relationshipId,
        personName: r.personName,
        label: r.label,
        type: r.type,
        sunSign: r.sunSign,
        moonSign: r.moonSign,
        risingSign: r.risingSign,
        compatibilitySnapshot: r.compatibilitySnapshot as Relationship['compatibilitySnapshot'],
        lastReadAt: r.lastReadAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
    }));

    return c.json({ relationships: items });
});

app.post('/relationships', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    let payload: {
        personName?: string;
        label?: string;
        type?: string;
        sunSign?: string;
        moonSign?: string;
        risingSign?: string;
    } | null = null;

    try {
        payload = await c.req.json();
    } catch {
        return c.json({ error: 'invalid_json' }, 400);
    }

    if (!payload?.personName || !payload?.label || !payload?.type) {
        return c.json({ error: 'personName_label_type_required' }, 400);
    }

    const [rel] = await db
        .insert(relationships)
        .values({
            userId: authUser.userId,
            personName: payload.personName.trim(),
            label: payload.label.trim(),
            type: payload.type as typeof relationships.$inferInsert.type,
            sunSign: payload.sunSign ?? null,
            moonSign: payload.moonSign ?? null,
            risingSign: payload.risingSign ?? null,
        })
        .returning();

    const result: Relationship = {
        id: rel.relationshipId,
        personName: rel.personName,
        label: rel.label,
        type: rel.type,
        sunSign: rel.sunSign,
        moonSign: rel.moonSign,
        risingSign: rel.risingSign,
        compatibilitySnapshot: null,
        lastReadAt: null,
        createdAt: rel.createdAt.toISOString(),
    };

    return c.json({ relationship: result }, 201);
});

app.get('/relationships/:id', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const relId = c.req.param('id');
    const rel = await db.query.relationships.findFirst({
        where: and(eq(relationships.relationshipId, relId), eq(relationships.userId, authUser.userId)),
    });

    if (!rel) {
        return c.json({ error: 'not_found' }, 404);
    }

    // Check if compatibility snapshot needs refresh (>7 days old or missing)
    let snapshot = rel.compatibilitySnapshot as Relationship['compatibilitySnapshot'];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (!snapshot || !rel.lastReadAt || rel.lastReadAt < sevenDaysAgo) {
        // Generate fresh compatibility read
        snapshot = await generateCompatibilityRead(authUser.userId, rel);
        if (snapshot) {
            await db
                .update(relationships)
                .set({
                    compatibilitySnapshot: snapshot,
                    lastReadAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(relationships.relationshipId, relId));
        }
    }

    const result: Relationship = {
        id: rel.relationshipId,
        personName: rel.personName,
        label: rel.label,
        type: rel.type,
        sunSign: rel.sunSign,
        moonSign: rel.moonSign,
        risingSign: rel.risingSign,
        compatibilitySnapshot: snapshot,
        lastReadAt: rel.lastReadAt?.toISOString() ?? new Date().toISOString(),
        createdAt: rel.createdAt.toISOString(),
    };

    return c.json({ relationship: result });
});

app.patch('/relationships/:id', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const relId = c.req.param('id');
    let payload: {
        personName?: string;
        label?: string;
        type?: string;
        sunSign?: string;
        moonSign?: string;
        risingSign?: string;
    } | null = null;

    try {
        payload = await c.req.json();
    } catch {
        return c.json({ error: 'invalid_json' }, 400);
    }

    const existing = await db.query.relationships.findFirst({
        where: and(eq(relationships.relationshipId, relId), eq(relationships.userId, authUser.userId)),
    });

    if (!existing) {
        return c.json({ error: 'not_found' }, 404);
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (payload?.personName !== undefined) updates.personName = payload.personName.trim();
    if (payload?.label !== undefined) updates.label = payload.label.trim();
    if (payload?.type !== undefined) updates.type = payload.type;

    // If signs change, invalidate compatibility snapshot
    let signsChanged = false;
    if (payload?.sunSign !== undefined) {
        updates.sunSign = payload.sunSign;
        signsChanged = payload.sunSign !== existing.sunSign;
    }
    if (payload?.moonSign !== undefined) {
        updates.moonSign = payload.moonSign;
        signsChanged = signsChanged || payload.moonSign !== existing.moonSign;
    }
    if (payload?.risingSign !== undefined) {
        updates.risingSign = payload.risingSign;
        signsChanged = signsChanged || payload.risingSign !== existing.risingSign;
    }
    if (signsChanged) {
        updates.compatibilitySnapshot = null;
        updates.lastReadAt = null;
    }

    const [updated] = await db
        .update(relationships)
        .set(updates)
        .where(eq(relationships.relationshipId, relId))
        .returning();

    const result: Relationship = {
        id: updated.relationshipId,
        personName: updated.personName,
        label: updated.label,
        type: updated.type,
        sunSign: updated.sunSign,
        moonSign: updated.moonSign,
        risingSign: updated.risingSign,
        compatibilitySnapshot: updated.compatibilitySnapshot as Relationship['compatibilitySnapshot'],
        lastReadAt: updated.lastReadAt?.toISOString() ?? null,
        createdAt: updated.createdAt.toISOString(),
    };

    return c.json({ relationship: result });
});

app.delete('/relationships/:id', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const relId = c.req.param('id');
    const existing = await db.query.relationships.findFirst({
        where: and(eq(relationships.relationshipId, relId), eq(relationships.userId, authUser.userId)),
    });

    if (!existing) {
        return c.json({ error: 'not_found' }, 404);
    }

    await db.delete(relationships).where(eq(relationships.relationshipId, relId));
    return c.json({ success: true });
});

async function generateCompatibilityRead(
    userId: string,
    rel: typeof relationships.$inferSelect,
): Promise<Relationship['compatibilitySnapshot']> {
    const openrouter = getOpenRouter();
    if (!openrouter) return null;

    // Get user's chart
    const userChart = await db.query.charts.findFirst({
        where: eq(charts.userId, userId),
    });

    if (!userChart?.sunSign) return null;

    const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

    const userSigns = [
        `Sun: ${userChart.sunSign}`,
        userChart.moonSign ? `Moon: ${userChart.moonSign}` : null,
        userChart.risingSign ? `Rising: ${userChart.risingSign}` : null,
    ].filter(Boolean).join(', ');

    const partnerSigns = [
        rel.sunSign ? `Sun: ${rel.sunSign}` : null,
        rel.moonSign ? `Moon: ${rel.moonSign}` : null,
        rel.risingSign ? `Rising: ${rel.risingSign}` : null,
    ].filter(Boolean).join(', ');

    const prompt = `Analyze the astrological compatibility between the user and ${rel.personName} (${rel.label}, ${rel.type}).

User's signs: ${userSigns}
${rel.personName}'s signs: ${partnerSigns || 'Sun sign unknown'}

Respond in EXACTLY this JSON format (no markdown, no code blocks):
{"summary":"2-3 sentence overview","strengths":["strength 1","strength 2","strength 3"],"tensions":["tension 1","tension 2"],"tip":"one actionable tip","score":75}

The score should be 1-100. Be honest but constructive. Use Lumi's voice (warm, direct, slightly sassy).`;

    try {
        const result = streamText({
            model: openrouter(model),
            messages: [
                { role: 'system', content: LUMI_SYSTEM_PROMPT },
                { role: 'user', content: prompt },
            ],
        });

        let text = '';
        for await (const chunk of (await result).textStream) {
            text += chunk;
        }

        // Parse JSON from response, handling potential markdown wrapping
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            summary: parsed.summary ?? '',
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            tensions: Array.isArray(parsed.tensions) ? parsed.tensions : [],
            tip: parsed.tip ?? '',
            score: typeof parsed.score === 'number' ? parsed.score : 50,
            generatedAt: new Date().toISOString(),
            version: 1,
        };
    } catch {
        return null;
    }
}

// ============================================================================
// TAROT
// ============================================================================

app.post('/tarot/pull', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    let payload: { spread?: 'single' | 'three-card'; context?: string } | null = null;
    try {
        payload = await c.req.json();
    } catch {
        payload = {};
    }

    const spread = payload?.spread ?? 'single';
    const context = payload?.context?.trim() || null;

    // Rate limit: 1 pull per day per spread type
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingToday = await db.query.tarotPulls.findFirst({
        where: and(
            eq(tarotPulls.userId, authUser.userId),
            eq(tarotPulls.spread, spread),
            gt(tarotPulls.createdAt, todayStart),
        ),
    });

    if (existingToday) {
        // Return existing pull instead of error
        const result: TarotPull = {
            id: existingToday.pullId,
            spread: existingToday.spread,
            cards: existingToday.cards as TarotPull['cards'],
            interpretation: existingToday.interpretation,
            context: existingToday.context,
            createdAt: existingToday.createdAt.toISOString(),
        };
        return c.json({ pull: result, alreadyPulled: true });
    }

    // Draw cards server-side with crypto-secure shuffle
    const { drawCards } = await import('@/lib/tarot-draw');
    const numCards = spread === 'three-card' ? 3 : 1;
    const positions = spread === 'three-card' ? ['Past', 'Present', 'Future'] : ['Daily Card'];
    const drawnCards = drawCards(numCards);

    const cards = drawnCards.map((card, i) => ({
        cardId: card.id,
        reversed: card.reversed,
        position: positions[i],
    }));

    // Generate interpretation
    const { buildTarotPrompt } = await import('@/lib/tarot-prompt');
    const interpretationPrompt = buildTarotPrompt(cards, spread, context);

    let interpretation: string | null = null;
    const reply = await requestAssistantReply([
        { role: 'system', content: LUMI_SYSTEM_PROMPT },
        { role: 'user', content: interpretationPrompt },
    ]);

    if (!('error' in reply)) {
        interpretation = reply.reply;
    }

    const [pull] = await db
        .insert(tarotPulls)
        .values({
            userId: authUser.userId,
            spread,
            cards,
            interpretation,
            context,
        })
        .returning();

    const result: TarotPull = {
        id: pull.pullId,
        spread: pull.spread,
        cards: pull.cards as TarotPull['cards'],
        interpretation: pull.interpretation,
        context: pull.context,
        createdAt: pull.createdAt.toISOString(),
    };

    return c.json({ pull: result, alreadyPulled: false }, 201);
});

app.get('/tarot/pulls', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const pulls = await db
        .select()
        .from(tarotPulls)
        .where(eq(tarotPulls.userId, authUser.userId))
        .orderBy(desc(tarotPulls.createdAt))
        .limit(30);

    const items: TarotPull[] = pulls.map((p) => ({
        id: p.pullId,
        spread: p.spread,
        cards: p.cards as TarotPull['cards'],
        interpretation: p.interpretation,
        context: p.context,
        createdAt: p.createdAt.toISOString(),
    }));

    return c.json({ pulls: items });
});

app.post('/tarot/pulls/:id/reinterpret', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const pullId = c.req.param('id');
    const pull = await db.query.tarotPulls.findFirst({
        where: and(eq(tarotPulls.pullId, pullId), eq(tarotPulls.userId, authUser.userId)),
    });

    if (!pull) {
        return c.json({ error: 'not_found' }, 404);
    }

    const { buildTarotPrompt } = await import('@/lib/tarot-prompt');
    const cards = pull.cards as TarotPull['cards'];
    const prompt = buildTarotPrompt(cards, pull.spread, pull.context);

    const reply = await requestAssistantReply([
        { role: 'system', content: LUMI_SYSTEM_PROMPT },
        { role: 'user', content: prompt + '\n\nGive a fresh interpretation, different from any previous one.' },
    ]);

    if ('error' in reply) {
        return c.json({ error: reply.error }, 502);
    }

    await db
        .update(tarotPulls)
        .set({ interpretation: reply.reply, reinterpretedAt: new Date() })
        .where(eq(tarotPulls.pullId, pullId));

    const result: TarotPull = {
        id: pull.pullId,
        spread: pull.spread,
        cards,
        interpretation: reply.reply,
        context: pull.context,
        createdAt: pull.createdAt.toISOString(),
    };

    return c.json({ pull: result });
});

// ============================================================================
// POLLS (unchanged)
// ============================================================================

app.get('/polls', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    let userSunSign: string | null = null;

    if (authUser) {
        const chart = await db.query.charts.findFirst({
            where: eq(charts.userId, authUser.userId),
            columns: { sunSign: true },
        });
        userSunSign = chart?.sunSign ?? null;
    }

    const now = new Date();

    const activePolls = await db
        .select()
        .from(polls)
        .where(
            and(
                isNull(polls.closedAt),
                or(isNull(polls.expiresAt), gt(polls.expiresAt, now))
            )
        )
        .orderBy(desc(polls.featured), desc(polls.createdAt))
        .limit(20);

    const userVotes: Map<string, string> = new Map();
    if (authUser && activePolls.length > 0) {
        const pollIds = activePolls.map((p) => p.pollId);
        const votes = await db
            .select({ pollId: pollVotes.pollId, optionId: pollVotes.optionId })
            .from(pollVotes)
            .where(and(eq(pollVotes.userId, authUser.userId), inArray(pollVotes.pollId, pollIds)));
        for (const v of votes) {
            userVotes.set(v.pollId, v.optionId);
        }
    }

    const pollIds = activePolls.map((p) => p.pollId);
    const allOptions = pollIds.length > 0
        ? await db
            .select()
            .from(pollOptions)
            .where(inArray(pollOptions.pollId, pollIds))
            .orderBy(pollOptions.displayOrder)
        : [];

    const optionsByPoll = new Map<string, typeof allOptions>();
    for (const opt of allOptions) {
        const existing = optionsByPoll.get(opt.pollId) ?? [];
        existing.push(opt);
        optionsByPoll.set(opt.pollId, existing);
    }

    const formattedPolls: Poll[] = activePolls
        .filter((poll) => {
            const targets = poll.targetSigns as string[] | null;
            if (!targets || targets.length === 0) return true;
            if (!userSunSign) return false;
            return targets.includes(userSunSign);
        })
        .map((poll) => {
            const opts = optionsByPoll.get(poll.pollId) ?? [];
            const totalVotes = opts.reduce((sum, o) => sum + o.voteCount, 0);
            const userVote = userVotes.get(poll.pollId);
            const hasVoted = !!userVote;
            const showResults = poll.showResultsBeforeVote || hasVoted;

            const formattedOptions: PollOption[] = opts.map((o) => ({
                id: o.optionId,
                text: o.text,
                voteCount: showResults ? o.voteCount : 0,
                percentage: showResults && totalVotes > 0 ? Math.round((o.voteCount / totalVotes) * 100) : 0,
            }));

            return {
                id: poll.pollId,
                question: poll.question,
                description: poll.description ?? undefined,
                options: formattedOptions,
                astroTags: (poll.astroTags as string[] | null) ?? undefined,
                totalVotes: showResults ? totalVotes : 0,
                userVote,
                showResults,
                featured: poll.featured ?? false,
                expiresAt: poll.expiresAt?.toISOString(),
                createdAt: poll.createdAt.toISOString(),
            };
        });

    return c.json({ polls: formattedPolls });
});

app.get('/polls/:pollId', async (c) => {
    const pollId = c.req.param('pollId');
    const authUser = await verifyAuthToken(c.req.raw);

    const poll = await db.query.polls.findFirst({
        where: eq(polls.pollId, pollId),
    });

    if (!poll) {
        return c.json({ error: 'poll_not_found' }, 404);
    }

    const opts = await db
        .select()
        .from(pollOptions)
        .where(eq(pollOptions.pollId, pollId))
        .orderBy(pollOptions.displayOrder);

    let userVote: string | undefined;
    if (authUser) {
        const vote = await db.query.pollVotes.findFirst({
            where: and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, authUser.userId)),
            columns: { optionId: true },
        });
        userVote = vote?.optionId;
    }

    const totalVotes = opts.reduce((sum, o) => sum + o.voteCount, 0);
    const hasVoted = !!userVote;
    const showResults = poll.showResultsBeforeVote || hasVoted;

    const formattedOptions: PollOption[] = opts.map((o) => ({
        id: o.optionId,
        text: o.text,
        voteCount: showResults ? o.voteCount : 0,
        percentage: showResults && totalVotes > 0 ? Math.round((o.voteCount / totalVotes) * 100) : 0,
    }));

    const formattedPoll: Poll = {
        id: poll.pollId,
        question: poll.question,
        description: poll.description ?? undefined,
        options: formattedOptions,
        astroTags: (poll.astroTags as string[] | null) ?? undefined,
        totalVotes: showResults ? totalVotes : 0,
        userVote,
        showResults,
        featured: poll.featured ?? false,
        expiresAt: poll.expiresAt?.toISOString(),
        createdAt: poll.createdAt.toISOString(),
    };

    return c.json({ poll: formattedPoll });
});

app.post('/polls/:pollId/vote', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const pollId = c.req.param('pollId');

    let payload: { optionId?: string; idempotencyKey?: string } | null = null;
    try {
        payload = await c.req.json();
    } catch {
        return c.json({ error: 'invalid_json' }, 400);
    }

    if (!payload?.optionId) {
        return c.json({ error: 'option_id_required' }, 400);
    }

    const { optionId, idempotencyKey } = payload;

    try {
        const result = await db.transaction(async (tx) => {
            if (idempotencyKey) {
                const existingVote = await tx.query.pollVotes.findFirst({
                    where: eq(pollVotes.idempotencyKey, idempotencyKey),
                });
                if (existingVote) {
                    return { success: true, alreadyVoted: true, optionId: existingVote.optionId };
                }
            }

            const poll = await tx.query.polls.findFirst({
                where: eq(polls.pollId, pollId),
            });

            if (!poll) return { error: 'poll_not_found' };
            if (poll.closedAt) return { error: 'poll_closed' };
            if (poll.expiresAt && poll.expiresAt < new Date()) return { error: 'poll_expired' };

            const option = await tx.query.pollOptions.findFirst({
                where: and(eq(pollOptions.optionId, optionId), eq(pollOptions.pollId, pollId)),
            });

            if (!option) return { error: 'invalid_option' };

            const existingVote = await tx.query.pollVotes.findFirst({
                where: and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, authUser.userId)),
            });

            if (existingVote) return { error: 'already_voted' };

            const chart = await tx.query.charts.findFirst({
                where: eq(charts.userId, authUser.userId),
                columns: { sunSign: true, moonSign: true },
            });

            await tx.insert(pollVotes).values({
                pollId,
                optionId,
                userId: authUser.userId,
                voterSunSign: chart?.sunSign ?? null,
                voterMoonSign: chart?.moonSign ?? null,
                idempotencyKey: idempotencyKey ?? null,
            });

            await tx
                .update(pollOptions)
                .set({ voteCount: sql`${pollOptions.voteCount} + 1` })
                .where(eq(pollOptions.optionId, optionId));

            return { success: true, alreadyVoted: false, optionId };
        });

        if ('error' in result) {
            const statusCode = result.error === 'poll_not_found' ? 404 : 400;
            return c.json({ error: result.error }, statusCode);
        }

        if (result.success && !result.alreadyVoted) {
            const opts = await db
                .select()
                .from(pollOptions)
                .where(eq(pollOptions.pollId, pollId));
            const totalVotes = opts.reduce((sum, o) => sum + o.voteCount, 0);

            await triggerPollVote(pollId, {
                optionId: result.optionId,
                totalVotes,
                options: opts.map((o) => ({
                    id: o.optionId,
                    voteCount: o.voteCount,
                    percentage: totalVotes > 0 ? Math.round((o.voteCount / totalVotes) * 100) : 0,
                })),
            });
        }

        return c.json({ success: true, optionId: result.optionId });
    } catch (error) {
        if (error instanceof Error && error.message.includes('unique')) {
            return c.json({ error: 'already_voted' }, 400);
        }
        console.error('[Poll Vote] Error:', error);
        return c.json({ error: 'vote_failed' }, 500);
    }
});

app.get('/polls/:pollId/signs', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const pollId = c.req.param('pollId');

    const userVote = await db.query.pollVotes.findFirst({
        where: and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, authUser.userId)),
    });

    if (!userVote) {
        return c.json({ error: 'must_vote_first' }, 403);
    }

    const votes = await db
        .select({
            optionId: pollVotes.optionId,
            sunSign: pollVotes.voterSunSign,
        })
        .from(pollVotes)
        .where(eq(pollVotes.pollId, pollId));

    const breakdown: PollSignBreakdown = {};
    for (const vote of votes) {
        const sign = vote.sunSign ?? 'Unknown';
        if (!breakdown[sign]) breakdown[sign] = {};
        breakdown[sign][vote.optionId] = (breakdown[sign][vote.optionId] || 0) + 1;
    }

    return c.json({ breakdown });
});

app.post('/admin/polls', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const user = await db.query.users.findFirst({
        where: eq(users.userId, authUser.userId),
        columns: { isAdmin: true },
    });

    if (!user?.isAdmin) {
        return c.json({ error: 'forbidden' }, 403);
    }

    let payload: {
        question?: string;
        description?: string;
        options?: string[];
        astroTags?: string[];
        targetSigns?: string[];
        showResultsBeforeVote?: boolean;
        featured?: boolean;
        expiresAt?: string;
    } | null = null;

    try {
        payload = await c.req.json();
    } catch {
        return c.json({ error: 'invalid_json' }, 400);
    }

    if (!payload?.question || !payload.options || payload.options.length < 2) {
        return c.json({ error: 'question_and_options_required' }, 400);
    }

    const { question, description, options, astroTags, targetSigns, showResultsBeforeVote, featured, expiresAt } = payload;

    const result = await db.transaction(async (tx) => {
        const [poll] = await tx
            .insert(polls)
            .values({
                question,
                description: description ?? null,
                astroTags: astroTags ?? null,
                targetSigns: targetSigns ?? null,
                showResultsBeforeVote: showResultsBeforeVote ?? false,
                featured: featured ?? false,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                createdBy: authUser.userId,
            })
            .returning();

        const optionValues = options.map((text, index) => ({
            pollId: poll.pollId,
            text,
            displayOrder: index,
        }));

        const createdOptions = await tx.insert(pollOptions).values(optionValues).returning();
        return { poll, options: createdOptions };
    });

    return c.json({
        poll: {
            id: result.poll.pollId,
            question: result.poll.question,
            options: result.options.map((o) => ({ id: o.optionId, text: o.text })),
        },
    }, 201);
});
