/**
 * Auth utilities for use with Privy.
 *
 * This module provides helper hooks and functions for authentication.
 * Uses Privy under the hood but abstracts it for easier use throughout the app.
 */

'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useMemo } from 'react';

export type AuthUser = {
    id: string;
    email: string | null;
    wallet: string | null;
    isAuthenticated: boolean;
};

/**
 * Hook to get current authenticated user.
 * Returns null if not authenticated or Privy not configured.
 *
 * IMPORTANT: This hook must be used inside PrivyProvider.
 * Hooks are called unconditionally to comply with React's Rules of Hooks.
 */
export function useAuth() {
    // Hooks must be called unconditionally to maintain consistent hook order
    const privyData = usePrivy();
    const walletsData = useWallets();

    const user = useMemo((): AuthUser | null => {
        if (!privyData.ready || !privyData.authenticated || !privyData.user) {
            return null;
        }

        const { user: privyUser } = privyData;
        const wallets = walletsData.wallets ?? [];

        // Get first available wallet
        const primaryWallet = wallets[0];

        return {
            id: privyUser.id,
            email: privyUser.email?.address ?? null,
            wallet: primaryWallet?.address ?? null,
            isAuthenticated: true,
        };
    }, [privyData.ready, privyData.authenticated, privyData.user, walletsData.wallets]);

    return {
        user,
        isLoading: !privyData.ready,
        isAuthenticated: !!user,
        login: privyData.login,
        logout: privyData.logout,
    };
}

/**
 * Hook to get user's wallet for transactions.
 *
 * IMPORTANT: This hook must be used inside PrivyProvider.
 */
export function useWallet() {
    // Hooks must be called unconditionally to maintain consistent hook order
    const walletsData = useWallets();

    const wallet = useMemo(() => {
        if (!walletsData.wallets) return null;
        return walletsData.wallets[0] ?? null;
    }, [walletsData.wallets]);

    return {
        wallet,
        address: wallet?.address ?? null,
        isConnected: !!wallet,
    };
}
