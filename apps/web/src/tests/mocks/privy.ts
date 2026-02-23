import { vi } from 'vitest';

export const mockPrivyUser = {
    id: 'did:privy:test-user-123',
    email: { address: 'test@example.com' },
    wallet: { address: '0x1234567890abcdef' },
};

export const mockUsePrivy = vi.fn(() => ({
    ready: true,
    authenticated: true,
    user: mockPrivyUser,
    login: vi.fn(),
    logout: vi.fn(),
    getAccessToken: vi.fn().mockResolvedValue('mock-token'),
}));

export const mockUseWallets = vi.fn(() => ({
    wallets: [],
}));

// Setup module mock
vi.mock('@privy-io/react-auth', () => ({
    usePrivy: () => mockUsePrivy(),
    useWallets: () => mockUseWallets(),
    PrivyProvider: ({ children }: { children: React.ReactNode }) => children,
}));
