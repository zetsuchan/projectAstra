import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@privy-io/server-auth', () => ({
    PrivyClient: vi.fn(),
}));

vi.mock('@/db', () => {
    const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
        query: {
            users: { findFirst: vi.fn() },
            charts: { findFirst: vi.fn() },
            chatThreads: { findFirst: vi.fn() },
            diaryEntries: { findFirst: vi.fn() },
            relationships: { findFirst: vi.fn() },
            tarotPulls: { findFirst: vi.fn() },
            polls: { findFirst: vi.fn() },
            pollVotes: { findFirst: vi.fn() },
            pollOptions: { findFirst: vi.fn() },
        },
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{
                    entryId: 'entry-1',
                    userId: 'user-123',
                    title: null,
                    body: 'Test entry',
                    mood: 'calm',
                    moodTags: ['calm'],
                    aiReflection: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }]),
            }),
        }),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockReturnThis(),
        transaction: vi.fn(),
        execute: vi.fn(),
    };
    return { db: mockDb };
});

vi.mock('@/lib/auth-server', () => ({
    verifyAuthToken: vi.fn(),
}));

vi.mock('@/lib/pusher', () => ({
    triggerPollVote: vi.fn(),
}));

import { app } from '@/app/api/[[...route]]/app';
import { verifyAuthToken } from '@/lib/auth-server';

describe('Diary endpoints', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET /diary/entries requires auth', async () => {
        vi.mocked(verifyAuthToken).mockResolvedValue(null);

        const res = await app.request('/api/diary/entries');
        expect(res.status).toBe(401);
    });

    it('POST /diary/entries requires auth', async () => {
        vi.mocked(verifyAuthToken).mockResolvedValue(null);

        const res = await app.request('/api/diary/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: 'test' }),
        });
        expect(res.status).toBe(401);
    });

    it('POST /diary/entries rejects empty body', async () => {
        vi.mocked(verifyAuthToken).mockResolvedValue({ userId: 'user-123', privyId: 'privy-123' });

        const res = await app.request('/api/diary/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: '' }),
        });
        expect(res.status).toBe(400);
    });

    it('DELETE /diary/entries/:id returns 404 for non-existent', async () => {
        vi.mocked(verifyAuthToken).mockResolvedValue({ userId: 'user-123', privyId: 'privy-123' });

        const { db } = await import('@/db');
        vi.mocked(db.query.diaryEntries.findFirst).mockResolvedValue(undefined);

        const res = await app.request('/api/diary/entries/nonexistent', {
            method: 'DELETE',
        });
        expect(res.status).toBe(404);
    });
});
