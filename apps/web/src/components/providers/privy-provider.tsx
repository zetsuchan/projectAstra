'use client';

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { type ReactNode } from 'react';

const solanaConnectors = toSolanaWalletConnectors({
    shouldAutoConnect: true,
});

/**
 * Privy Provider for authentication and wallet management.
 *
 * Setup:
 * 1. Create account at https://dashboard.privy.io
 * 2. Create an app and get your App ID
 * 3. Set NEXT_PUBLIC_PRIVY_APP_ID in .env.local
 * 4. Configure login methods and wallets in Privy dashboard:
 *    - Enable Google, Apple, Email login
 *    - Enable Solana wallets: Phantom, Backpack, Solflare
 *    - Configure RPC endpoints for Solana devnet/mainnet
 */

interface PrivyProviderProps {
    children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

    // If no app ID, render children without Privy (for local dev without auth)
    if (!appId) {
        console.warn('[Privy] NEXT_PUBLIC_PRIVY_APP_ID not set. Auth disabled.');
        return <>{children}</>;
    }

    return (
        <BasePrivyProvider
            appId={appId}
            config={{
                // Login methods - also configure in Privy dashboard
                loginMethods: ['email', 'google', 'apple', 'wallet'],

                // Appearance
                appearance: {
                    theme: 'dark',
                    accentColor: '#f9a8d4', // Rose-300 from our palette
                    logo: '/favicon.ico',
                    walletList: [
                        'phantom',
                        'backpack',
                        'metamask',
                        'rabby_wallet',
                        'detected_wallets',
                    ],
                    walletChainType: 'ethereum-and-solana',
                },

                // Embedded wallets - auto-create Solana wallet for social login users
                embeddedWallets: {
                    solana: {
                        createOnLogin: 'users-without-wallets',
                    },
                },

                // External wallets - prioritize Solana
                externalWallets: {
                    solana: {
                        connectors: solanaConnectors,
                    },
                },
            }}
        >
            {children}
        </BasePrivyProvider>
    );
}
