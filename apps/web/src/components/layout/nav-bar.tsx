'use client';
import { Sun, Moon, MessageCircle, Newspaper, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

interface NavBarProps {
    theme?: string;
    toggleTheme?: () => void;
}

export const NavBar = ({ theme, toggleTheme }: NavBarProps) => {
    const { ready, authenticated, user, login, logout } = usePrivy();

    return (
        <nav className="fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-50 text-[var(--text-main)] transition-colors duration-500">
            <Link href="/" className="font-serif text-lg tracking-wider italic cursor-pointer">Astra</Link>
            <div className="hidden md:flex gap-8 text-xs tracking-widest uppercase font-sans font-medium opacity-60">
                <Link href="/chat" className="hover:opacity-100 transition-opacity">Chat</Link>
                <Link href="/feed" className="hover:opacity-100 transition-opacity">Feed</Link>
                <Link href="/markets" className="hover:opacity-100 transition-opacity">Markets</Link>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-main)]"
                    aria-label="Toggle Theme"
                >
                    <Sun size={18} className="hidden dark:block" />
                    <Moon size={18} className="block dark:hidden" />
                </button>
                {authenticated && user ? (
                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-xs text-[var(--text-muted)] max-w-[120px] truncate">
                            {user.email?.address ?? (user.wallet?.address ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}` : 'Connected')}
                        </span>
                        <button
                            onClick={() => logout()}
                            className="px-4 py-1.5 border border-[var(--border-color)] rounded-full text-xs uppercase tracking-widest hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => login()}
                        disabled={!ready}
                        className="hidden md:block px-4 py-1.5 border border-[var(--border-color)] rounded-full text-xs uppercase tracking-widest hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all disabled:opacity-50"
                    >
                        {!ready ? 'Loading...' : 'Sign In'}
                    </button>
                )}
            </div>
        </nav>
    );
};

export const MobileNav = () => {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Sparkles, label: 'Home' },
        { href: '/chat', icon: MessageCircle, label: 'Chat' },
        { href: '/feed', icon: Newspaper, label: 'Feed' },
        { href: '/markets', icon: TrendingUp, label: 'Markets' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-[var(--bg-main)]/95 backdrop-blur-sm border-t border-[var(--border-color)]">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                                isActive
                                    ? 'text-[var(--accent-pink)]'
                                    : 'text-[var(--text-main)] opacity-50 hover:opacity-80'
                            }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
