'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sun, Moon, Sparkles, Clock, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { OrbitVisual } from '@/components/ui/orbit-visual';
import { useAuthenticatedFetch } from '@/lib/auth';
import { TarotSpread } from '@/components/tarot/tarot-spread';
import { pullTarot, fetchTarotPulls, reinterpretTarot } from '@/lib/api-client';
import type { TarotPull } from '@/lib/api-types';

export default function TarotPage() {
    const { ready, authenticated, user, login, logout } = usePrivy();
    const authFetch = useAuthenticatedFetch();
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
        document.documentElement.classList.toggle('light');
    };

    const [currentPull, setCurrentPull] = useState<TarotPull | null>(null);
    const [pastPulls, setPastPulls] = useState<TarotPull[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const [isReinterpreting, setIsReinterpreting] = useState(false);
    const [showPast, setShowPast] = useState(false);
    const [alreadyPulled, setAlreadyPulled] = useState(false);
    const [context, setContext] = useState('');
    const [showContextInput, setShowContextInput] = useState(false);

    const loadPastPulls = useCallback(async () => {
        if (!authenticated) return;
        const pulls = await fetchTarotPulls(authFetch);
        setPastPulls(pulls);
    }, [authenticated, authFetch]);

    useEffect(() => {
        loadPastPulls();
    }, [loadPastPulls]);

    const handlePull = async (spread: 'single' | 'three-card' = 'single') => {
        if (isPulling) return;
        setIsPulling(true);
        setCurrentPull(null);
        setAlreadyPulled(false);

        const result = await pullTarot(spread, context || undefined, authFetch);

        if (result) {
            setCurrentPull(result.pull);
            setAlreadyPulled(result.alreadyPulled);
            setShowContextInput(false);
            setContext('');
            // Refresh past pulls
            loadPastPulls();
        }

        setIsPulling(false);
    };

    const handleReinterpret = async () => {
        if (!currentPull || isReinterpreting) return;
        setIsReinterpreting(true);

        const updated = await reinterpretTarot(currentPull.id, authFetch);
        if (updated) {
            setCurrentPull(updated);
        }

        setIsReinterpreting(false);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`relative min-h-screen flex flex-col overflow-hidden ${theme}`}
        >
            <OrbitVisual theme={theme} />

            {/* Header */}
            <header className="relative z-20 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]/80 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--rose-400)] to-[var(--lilac-300)] flex items-center justify-center shadow-lg shadow-[var(--rose-400)]/20">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-serif text-lg leading-none text-[var(--text-main)]">Tarot</h2>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">Your daily cosmic pull</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-main)]"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    {authenticated && user ? (
                        <button onClick={() => logout()} className="hidden md:block px-4 py-1.5 border border-[var(--border-color)] rounded-full text-xs uppercase tracking-widest hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all">
                            Sign Out
                        </button>
                    ) : (
                        <button onClick={() => login()} disabled={!ready} className="hidden md:block px-4 py-1.5 border border-[var(--border-color)] rounded-full text-xs uppercase tracking-widest hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all disabled:opacity-50">
                            {!ready ? 'Loading...' : 'Sign In'}
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 relative z-10 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                <div className="max-w-2xl mx-auto space-y-6">

                    {!authenticated && (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <Sparkles size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="mb-4">Sign in to pull your daily card</p>
                            <button onClick={() => login()} className="px-6 py-2 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-sm font-medium hover:scale-105 transition-transform">
                                Sign In
                            </button>
                        </div>
                    )}

                    {authenticated && !currentPull && !isPulling && (
                        <div className="text-center space-y-6 py-8">
                            <div className="space-y-2">
                                <h3 className="font-serif text-2xl text-[var(--text-main)]">Your Daily Card</h3>
                                <p className="text-sm text-[var(--text-muted)]">What does the universe want you to know today?</p>
                            </div>

                            {/* Optional context input */}
                            <AnimatePresence>
                                {showContextInput && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <input
                                            value={context}
                                            onChange={e => setContext(e.target.value)}
                                            placeholder="What's on your mind? (optional)"
                                            className="w-full max-w-md mx-auto block bg-transparent border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--rose-400)] text-center"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex flex-col items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handlePull('single')}
                                    className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--rose-400)] to-[var(--lilac-300)] text-white font-medium shadow-lg shadow-[var(--rose-400)]/20 flex items-center gap-2"
                                >
                                    <Sparkles size={18} />
                                    Pull Daily Card
                                </motion.button>

                                <button
                                    onClick={() => setShowContextInput(!showContextInput)}
                                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                                >
                                    {showContextInput ? 'Hide question' : 'Ask a specific question'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Pulling animation */}
                    {isPulling && (
                        <div className="text-center py-16">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[var(--rose-400)]/30 border-t-[var(--rose-400)] flex items-center justify-center"
                            >
                                <Sparkles size={24} className="text-[var(--rose-300)]" />
                            </motion.div>
                            <p className="text-sm text-[var(--text-muted)]">Shuffling the cosmic deck...</p>
                        </div>
                    )}

                    {/* Current pull */}
                    {currentPull && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {alreadyPulled && (
                                <p className="text-center text-xs text-[var(--text-muted)]">
                                    You already pulled today. Here's your card:
                                </p>
                            )}

                            {/* Cards */}
                            <TarotSpread
                                cards={currentPull.cards}
                                autoReveal={alreadyPulled}
                            />

                            {/* Interpretation */}
                            {currentPull.interpretation && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]"
                                >
                                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--lilac-300)] uppercase tracking-wide mb-3">
                                        <Sparkles size={10} />
                                        Lumi's Reading
                                    </div>
                                    <p className="text-sm text-[var(--text-main)] leading-relaxed">
                                        {currentPull.interpretation}
                                    </p>

                                    <button
                                        onClick={handleReinterpret}
                                        disabled={isReinterpreting}
                                        className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors disabled:opacity-50"
                                    >
                                        <RotateCcw size={12} className={isReinterpreting ? 'animate-spin' : ''} />
                                        {isReinterpreting ? 'Reinterpreting...' : 'Get a fresh take'}
                                    </button>
                                </motion.div>
                            )}

                            {/* Pull again */}
                            {!alreadyPulled ? null : (
                                <p className="text-center text-xs text-[var(--text-muted)]">
                                    Come back tomorrow for a new pull.
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* Past pulls toggle */}
                    {authenticated && pastPulls.length > 0 && (
                        <div>
                            <button
                                onClick={() => setShowPast(!showPast)}
                                className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mx-auto"
                            >
                                <Clock size={14} />
                                {showPast ? 'Hide' : 'View'} past readings ({pastPulls.length})
                            </button>

                            <AnimatePresence>
                                {showPast && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 space-y-3 overflow-hidden"
                                    >
                                        {pastPulls.map((pull) => (
                                            <button
                                                key={pull.id}
                                                onClick={() => {
                                                    setCurrentPull(pull);
                                                    setAlreadyPulled(true);
                                                }}
                                                className="w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors text-left"
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs text-[var(--text-muted)]">{formatDate(pull.createdAt)}</span>
                                                    <span className="text-[10px] uppercase tracking-wider text-[var(--rose-300)]">{pull.spread}</span>
                                                </div>
                                                <p className="text-sm text-[var(--text-main)]">
                                                    {pull.cards.map(c => c.cardId.split('-').pop()).join(' / ')}
                                                </p>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
