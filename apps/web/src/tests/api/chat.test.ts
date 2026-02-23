import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock server-only dependencies
vi.mock('@privy-io/server-auth', () => ({
    PrivyClient: vi.fn(),
}));

vi.mock('@/db', () => {
    const chainable = () => {
        const chain: Record<string, unknown> = {};
        const methods = ['select', 'from', 'where', 'orderBy', 'limit', 'set', 'returning', 'values'];
        for (const m of methods) {
            chain[m] = vi.fn().mockReturnValue(chain);
        }
        chain.limit = vi.fn().mockResolvedValue([]);
        chain.returning = vi.fn().mockResolvedValue([{
            messageId: 'msg-123',
            threadId: 'thread-123',
            userId: 'user-123',
            role: 'user',
            content: 'hello',
            createdAt: new Date(),
        }]);

        return chain;
    };

    const c = chainable();

    return {
        db: {
            ...c,
            insert: vi.fn().mockReturnValue(c),
            update: vi.fn().mockReturnValue(c),
            delete: vi.fn().mockReturnValue(c),
            query: {
                users: { findFirst: vi.fn() },
                charts: { findFirst: vi.fn() },
                chatThreads: { findFirst: vi.fn() },
                chatMessages: { findFirst: vi.fn() },
                diaryEntries: { findFirst: vi.fn() },
                tarotPulls: { findFirst: vi.fn() },
                relationships: { findFirst: vi.fn() },
                polls: { findFirst: vi.fn() },
                pollVotes: { findFirst: vi.fn() },
                pollOptions: { findFirst: vi.fn() },
            },
            transaction: vi.fn(),
            execute: vi.fn(),
        },
    };
});

vi.mock('@/lib/auth-server', () => ({
    verifyAuthToken: vi.fn(),
}));

vi.mock('@/lib/pusher', () => ({
    triggerPollVote: vi.fn(),
}));

import { app } from '@/app/api/[[...route]]/app';
import { verifyAuthToken } from '@/lib/auth-server';

describe('Chat endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET /chat/threads/:id/messages requires auth', async () => {
        vi.mocked(verifyAuthToken).mockResolvedValue(null);

        const res = await app.request('/api/chat/threads/test-thread/messages');
        expect(res.status).toBe(401);
    });

    it('POST /chat/threads/:id/messages requires auth', async () => {
        vi.mocked(verifyAuthToken).mockResolvedValue(null);

        const res = await app.request('/api/chat/threads/test-thread/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: 'hello' }),
        });
        expect(res.status).toBe(401);
    });

    it('POST /chat/threads/:id/messages rejects empty content', async () => {
        vi.mocked(verifyAuthToken).mockResolvedValue({ userId: 'user-123', privyId: 'privy-123' });

        const res = await app.request('/api/chat/threads/test-thread/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: '' }),
        });
        expect(res.status).toBe(400);
    });
});
