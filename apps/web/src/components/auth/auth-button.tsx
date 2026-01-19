'use client';

import { useAuth } from '@/lib/auth';

/**
 * Authentication button component.
 * Shows "Sign In" when logged out, user info when logged in.
 */
export function AuthButton() {
    const { user, isLoading, isAuthenticated, login, logout } = useAuth();

    if (isLoading) {
        return (
            <button
                disabled
                className="px-5 py-2 border border-[var(--border-color)] rounded-full text-xs uppercase tracking-widest opacity-50"
            >
                Loading...
            </button>
        );
    }

    if (isAuthenticated && user) {
        return (
            <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-muted)] hidden sm:block">
                    {user.email ?? truncateAddress(user.wallet)}
                </span>
                <button
                    onClick={() => logout()}
                    className="px-5 py-2 border border-[var(--border-color)] rounded-full text-xs uppercase tracking-widest hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all duration-300"
                >
                    Sign Out
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => login()}
            className="px-5 py-2 border border-[var(--border-color)] rounded-full text-xs uppercase tracking-widest hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all duration-300"
        >
            Sign In
        </button>
    );
}

function truncateAddress(address: string | null): string {
    if (!address) return 'Connected';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
