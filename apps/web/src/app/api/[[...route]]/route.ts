import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { desc, eq, and, isNull, or, sql, inArray, gt } from 'drizzle-orm';
import { db } from '@/db';
import { feedItems, predictionMarkets, chatThreads, users, charts, polls, pollOptions, pollVotes } from '@/db/schema';
import type { ChatMessage, MarketsOverview, TrendingTopic, Poll, PollOption, PollSignBreakdown } from '@/lib/api-types';
import { buildUserContextPrompt } from '@/lib/context-builder';
import { LUMI_SYSTEM_PROMPT } from '@/lib/system-prompt';
import { verifyAuthToken, type AuthenticatedUser } from '@/lib/auth-server';
import { DEFAULT_THREAD_ID } from '@/lib/chat-constants';
import { triggerPollVote } from '@/lib/pusher';

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

type MessageRole = 'system' | 'user' | 'assistant';
type Message = { role: MessageRole; content: string };

const requestAssistantReply = async (messages: Message[]) => {
    const headers = getOpenRouterHeaders();
    if (!headers) {
        return { error: 'missing_openrouter_key' } as const;
    }

    const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
            messages,
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

// ============================================================================
// AUTH
// ============================================================================

/**
 * Sync authenticated user to database.
 * Called from client after Privy login to ensure user exists in our DB.
 */
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

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.privyId, privyId),
    });

    if (existingUser) {
        // Update existing user with latest info
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

    // Create new user
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

/**
 * Get current user's onboarding status and chart info
 */
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

/**
 * Save user's chart data and mark onboarding complete
 */
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

    // Create or update chart
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

    // Mark onboarding complete
    await db
        .update(users)
        .set({ onboardingCompleted: true })
        .where(eq(users.userId, authUser.userId));

    return c.json({ success: true });
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
        .map(([tag, count]) => ({ id: tag, label: `#${tag}`, volume: count }));

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
        volume: formatVolume(m.volumeCents),
        yes: parseInt(m.yesPercent, 10),
        no: parseInt(m.noPercent, 10),
        endsIn: formatEndsIn(m.endsAt),
        hot: parseInt(m.volumeCents, 10) > 10_000_000, // > $100k volume
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

function formatEndsIn(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    if (diffMs <= 0) return 'Ended';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
        return `${days}D ${hours}H`;
    }
    return `${hours}H`;
}

app.get('/chat/threads/:threadId/messages', (c) => {
    const messages: ChatMessage[] = [];
    return c.json({ messages });
});

app.post('/chat/threads/:threadId/messages', async (c) => {
    // Authenticate user from token - NEVER trust userId from request body
    const authUser = await verifyAuthToken(c.req.raw);

    let payload: { content?: string } | null = null;

    try {
        payload = await c.req.json();
    } catch {
        payload = null;
    }

    if (!payload?.content || !payload.content.trim()) {
        return c.json({ error: 'content_required' }, 400);
    }

    const threadId = c.req.param('threadId');

    // Verify thread belongs to authenticated user (if authenticated)
    if (authUser && threadId !== DEFAULT_THREAD_ID) {
        const thread = await db
            .select({ userId: chatThreads.userId })
            .from(chatThreads)
            .where(and(
                eq(chatThreads.threadId, threadId),
                eq(chatThreads.userId, authUser.userId)
            ))
            .limit(1);

        if (thread.length === 0) {
            // Thread doesn't exist or doesn't belong to this user
            return c.json({ error: 'thread_not_found' }, 404);
        }
    }

    const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        threadId,
        role: 'user',
        content: payload.content.trim(),
        createdAt: new Date().toISOString(),
    };

    // Build message array with system prompt and user context
    const messages: Message[] = [
        { role: 'system', content: LUMI_SYSTEM_PROMPT },
    ];

    // Add user-specific context only for authenticated users
    if (authUser) {
        const userContext = await buildUserContextPrompt(authUser.userId, threadId);
        if (userContext) {
            messages.push({ role: 'system', content: userContext });
        }
    }

    // Add the user's message
    messages.push({ role: 'user', content: userMessage.content });

    const assistantReply = await requestAssistantReply(messages);

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

// ============================================================================
// POLLS
// ============================================================================

/**
 * Get all active polls
 * Filters by user's sun sign if poll has targetSigns set
 */
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

    // Get active polls (not expired, not closed)
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

    // Get user's votes if authenticated
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

    // Get all options for these polls
    const pollIds = activePolls.map((p) => p.pollId);
    const allOptions = pollIds.length > 0
        ? await db
            .select()
            .from(pollOptions)
            .where(inArray(pollOptions.pollId, pollIds))
            .orderBy(pollOptions.displayOrder)
        : [];

    // Group options by poll
    const optionsByPoll = new Map<string, typeof allOptions>();
    for (const opt of allOptions) {
        const existing = optionsByPoll.get(opt.pollId) ?? [];
        existing.push(opt);
        optionsByPoll.set(opt.pollId, existing);
    }

    // Filter and format polls
    const formattedPolls: Poll[] = activePolls
        .filter((poll) => {
            // If poll has targetSigns, check if user's sign is included
            const targets = poll.targetSigns as string[] | null;
            if (!targets || targets.length === 0) return true;
            if (!userSunSign) return false; // Anonymous users don't see targeted polls
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

/**
 * Get a single poll by ID
 */
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

/**
 * Vote on a poll
 */
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

    // Use a transaction for consistency
    try {
        const result = await db.transaction(async (tx) => {
            // Check idempotency key if provided
            if (idempotencyKey) {
                const existingVote = await tx.query.pollVotes.findFirst({
                    where: eq(pollVotes.idempotencyKey, idempotencyKey),
                });
                if (existingVote) {
                    return { success: true, alreadyVoted: true, optionId: existingVote.optionId };
                }
            }

            // Verify poll exists and is open
            const poll = await tx.query.polls.findFirst({
                where: eq(polls.pollId, pollId),
            });

            if (!poll) {
                return { error: 'poll_not_found' };
            }

            if (poll.closedAt) {
                return { error: 'poll_closed' };
            }

            if (poll.expiresAt && poll.expiresAt < new Date()) {
                return { error: 'poll_expired' };
            }

            // Verify option belongs to this poll
            const option = await tx.query.pollOptions.findFirst({
                where: and(eq(pollOptions.optionId, optionId), eq(pollOptions.pollId, pollId)),
            });

            if (!option) {
                return { error: 'invalid_option' };
            }

            // Check if user already voted (unique constraint will catch this, but check first for better error)
            const existingVote = await tx.query.pollVotes.findFirst({
                where: and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, authUser.userId)),
            });

            if (existingVote) {
                return { error: 'already_voted' };
            }

            // Get user's chart for zodiac signs
            const chart = await tx.query.charts.findFirst({
                where: eq(charts.userId, authUser.userId),
                columns: { sunSign: true, moonSign: true },
            });

            // Insert vote
            await tx.insert(pollVotes).values({
                pollId,
                optionId,
                userId: authUser.userId,
                voterSunSign: chart?.sunSign ?? null,
                voterMoonSign: chart?.moonSign ?? null,
                idempotencyKey: idempotencyKey ?? null,
            });

            // Increment vote count on option
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

        // Trigger real-time update via Pusher
        if (result.success && !result.alreadyVoted) {
            // Get updated poll data for broadcast
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
        // Handle unique constraint violation
        if (error instanceof Error && error.message.includes('unique')) {
            return c.json({ error: 'already_voted' }, 400);
        }
        console.error('[Poll Vote] Error:', error);
        return c.json({ error: 'vote_failed' }, 500);
    }
});

/**
 * Get zodiac breakdown for a poll (only after voting)
 */
app.get('/polls/:pollId/signs', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const pollId = c.req.param('pollId');

    // Verify user has voted on this poll
    const userVote = await db.query.pollVotes.findFirst({
        where: and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, authUser.userId)),
    });

    if (!userVote) {
        return c.json({ error: 'must_vote_first' }, 403);
    }

    // Get all votes with sun signs
    const votes = await db
        .select({
            optionId: pollVotes.optionId,
            sunSign: pollVotes.voterSunSign,
        })
        .from(pollVotes)
        .where(eq(pollVotes.pollId, pollId));

    // Build breakdown: { [sign]: { [optionId]: count } }
    const breakdown: PollSignBreakdown = {};

    for (const vote of votes) {
        const sign = vote.sunSign ?? 'Unknown';
        if (!breakdown[sign]) {
            breakdown[sign] = {};
        }
        breakdown[sign][vote.optionId] = (breakdown[sign][vote.optionId] || 0) + 1;
    }

    return c.json({ breakdown });
});

/**
 * Create a new poll (admin only)
 */
app.post('/admin/polls', async (c) => {
    const authUser = await verifyAuthToken(c.req.raw);
    if (!authUser) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    // Check if user is admin
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

    // Create poll and options in a transaction
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

export const runtime = 'nodejs';

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
