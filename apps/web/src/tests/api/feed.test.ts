import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@privy-io/server-auth', () => ({
    PrivyClient: vi.fn(),
}));

// Mock the database before importing app
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
            polls: { findFirst: vi.fn() },
            pollVotes: { findFirst: vi.fn() },
            pollOptions: { findFirst: vi.fn() },
        },
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        transaction: vi.fn(),
        execute: vi.fn(),
    };
    return { db: mockDb };
});

vi.mock('@/lib/auth-server', () => ({
    verifyAuthToken: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/pusher', () => ({
    triggerPollVote: vi.fn(),
}));

import { app } from '@/app/api/[[...route]]/app';

describe('Feed endpoint', () => {
    it('GET /api/feed returns items array', async () => {
        const res = await app.request('/api/feed');
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data).toHaveProperty('items');
        expect(Array.isArray(data.items)).toBe(true);
    });

    it('GET /api/feed/trending returns topics array', async () => {
        const res = await app.request('/api/feed/trending');
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data).toHaveProperty('topics');
        expect(Array.isArray(data.topics)).toBe(true);
    });
});
