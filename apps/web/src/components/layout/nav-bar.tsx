'use client';
import { Sun, Moon } from 'lucide-react';
import Link from 'next/link';

interface NavBarProps {
    theme?: string; // Kept for compatibility, but we might move theme toggle to a provider
    toggleTheme?: () => void;
}

export const NavBar = ({ theme, toggleTheme }: NavBarProps) => (
    <nav className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 text-[var(--text-main)] transition-colors duration-500">
        <Link href="/" className="font-serif text-lg tracking-wider italic cursor-pointer">Astra</Link>
        <div className="hidden md:flex gap-8 text-xs tracking-widest uppercase font-sans font-medium opacity-60">
            <Link href="/chat" className="hover:opacity-100 transition-opacity">Chat</Link>
            <Link href="/feed" className="hover:opacity-100 transition-opacity">Feed</Link>
            <Link href="/markets" className="hover:opacity-100 transition-opacity">Markets</Link>
        </div>
        <div className="flex items-center gap-4">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-main)]"
                aria-label="Toggle Theme"
            >
                {/* Note: In a real app we'd access theme from context */}
                <Sun size={18} className="hidden dark:block" />
                <Moon size={18} className="block dark:hidden" />
            </button>
            <button className="px-5 py-2 border border-[var(--border-color)] rounded-full text-xs uppercase tracking-widest hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all duration-300">
                Sign In
            </button>
        </div>
    </nav>
);
