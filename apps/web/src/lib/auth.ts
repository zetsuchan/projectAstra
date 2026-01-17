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
 */
export function useAuth() {
    // Will throw if used outside PrivyProvider, but we handle missing config gracefully
    let privyData: ReturnType<typeof usePrivy> | null = null;
    let walletsData: ReturnType<typeof useWallets> | null = null;

    try {
        privyData = usePrivy();
        walletsData = useWallets();
    } catch {
        // Privy not configured
    }

    const user = useMemo((): AuthUser | null => {
        if (!privyData?.ready || !privyData?.authenticated || !privyData?.user) {
            return null;
        }

        const { user: privyUser } = privyData;
        const wallets = walletsData?.wallets ?? [];

        // Get first available wallet
        const primaryWallet = wallets[0];

        return {
            id: privyUser.id,
            email: privyUser.email?.address ?? null,
            wallet: primaryWallet?.address ?? null,
            isAuthenticated: true,
        };
    }, [privyData?.ready, privyData?.authenticated, privyData?.user, walletsData?.wallets]);

    return {
        user,
        isLoading: privyData ? !privyData.ready : false,
        isAuthenticated: !!user,
        login: privyData?.login ?? (() => {}),
        logout: privyData?.logout ?? (() => {}),
    };
}

/**
 * Hook to get user's wallet for transactions.
 */
export function useWallet() {
    let walletsData: ReturnType<typeof useWallets> | null = null;

    try {
        walletsData = useWallets();
    } catch {
        // Privy not configured
    }

    const wallet = useMemo(() => {
        if (!walletsData?.wallets) return null;
        return walletsData.wallets[0] ?? null;
    }, [walletsData?.wallets]);

    return {
        wallet,
        address: wallet?.address ?? null,
        isConnected: !!wallet,
    };
}
