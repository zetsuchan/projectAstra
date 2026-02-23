import { describe, it, expect, vi } from 'vitest';

// Mock server-only modules that can't run in jsdom
vi.mock('@/db', () => ({
    db: {},
}));

vi.mock('@/lib/auth-server', () => ({
    verifyAuthToken: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/pusher', () => ({
    triggerPollVote: vi.fn(),
}));

vi.mock('@privy-io/server-auth', () => ({
    PrivyClient: vi.fn(),
}));

import { app } from '@/app/api/[[...route]]/app';

describe('Health endpoint', () => {
    it('returns ok', async () => {
        const res = await app.request('/api/health');
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data).toEqual({ ok: true });
    });
});
