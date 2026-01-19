/**
 * Auth utilities for use with Privy.
 *
 * This module provides helper hooks and functions for authentication.
 * Uses Privy under the hood but abstracts it for easier use throughout the app.
 */

'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useMemo, useEffect, useRef } from 'react';

export type AuthUser = {
    id: string;
    email: string | null;
    wallet: string | null;
    isAuthenticated: boolean;
};

/**
 * Sync user to database after Privy authentication.
 * Called once per session when user becomes authenticated.
 */
async function syncUserToDatabase(privyId: string, email: string | null, walletAddress: string | null) {
    try {
        const res = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ privyId, email, walletAddress }),
        });

        if (!res.ok) {
            console.error('[Auth] Failed to sync user:', await res.text());
            return null;
        }

        const data = await res.json();
        console.log('[Auth] User synced:', data.created ? 'created' : 'updated');
        return data;
    } catch (error) {
        console.error('[Auth] Error syncing user:', error);
        return null;
    }
}

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
    const hasSyncedRef = useRef(false);

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

    // Sync user to database when authenticated
    useEffect(() => {
        if (user && !hasSyncedRef.current) {
            hasSyncedRef.current = true;
            syncUserToDatabase(user.id, user.email, user.wallet);
        }

        // Reset sync flag when user logs out
        if (!user) {
            hasSyncedRef.current = false;
        }
    }, [user]);

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

/**
 * Hook to make authenticated API requests.
 * Returns a fetch wrapper that includes the Privy access token.
 */
export function useAuthenticatedFetch() {
    const { getAccessToken } = usePrivy();

    const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
        const token = await getAccessToken();

        const headers = new Headers(options.headers);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return fetch(url, {
            ...options,
            headers,
        });
    };

    return authFetch;
}
