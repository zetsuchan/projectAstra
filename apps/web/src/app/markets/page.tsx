'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, Sun, Moon, Clock, Zap, Activity, Users } from 'lucide-react';
import Link from 'next/link';
import { OrbitVisual } from '@/components/ui/orbit-visual';
import type { MarketsOverview } from '@/lib/api-types';
import { fetchMarketsOverview } from '@/lib/api-client';

export default function MarketsPage() {
    const [theme, setTheme] = useState('dark');
    const [overview, setOverview] = useState<MarketsOverview>({
        featured: null,
        active: [],
        positions: [],
        balanceCents: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
        document.documentElement.classList.toggle('light');
    };

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            const data = await fetchMarketsOverview();
            if (isMounted) {
                setOverview(data);
                setIsLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const formattedBalance = overview.balanceCents !== null
        ? `$${(overview.balanceCents / 100).toFixed(2)}`
        : '--';

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`relative min-h-screen flex flex-col ${theme}`}
        >
            <OrbitVisual theme={theme} />

            {/* Markets Header */}
            <header className="sticky top-0 z-30 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]/80 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center">
                            <TrendingUp size={18} className="text-[var(--amber-200)]" />
                        </div>
                        <div>
                            <h2 className="font-serif text-lg leading-none text-[var(--text-main)]">Prediction Markets</h2>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">Bet on Outcomes</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)]">
                        <span className="text-xs text-[var(--text-muted)]">Balance:</span>
                        <span className="text-xs font-bold text-[var(--text-main)]">{formattedBalance}</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-main)]"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </header>

            {/* Content Layout */}
            <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row relative z-10 pt-6 px-4 md:px-6 gap-8 pb-20">

                {/* Left Column: Markets */}
                <div className="flex-1 space-y-8">

                    {/* Hero Market Card */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--amber-200)] to-[var(--rose-400)] rounded-3xl opacity-20 blur group-hover:opacity-30 transition duration-1000"></div>
                        <div className="relative bg-[var(--bg-main)] rounded-3xl border border-[var(--border-color)] p-6 md:p-8 overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-[var(--amber-200)] pointer-events-none">
                                <TrendingUp size={120} />
                            </div>

                            {overview.featured ? (
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 rounded bg-[var(--amber-200)]/20 text-[var(--amber-200)] text-[10px] font-bold uppercase tracking-wide border border-[var(--amber-200)]/20">Featured</span>
                                            {overview.featured.endsIn && (
                                                <span className="px-2 py-1 rounded bg-[var(--bg-card-hover)] text-[var(--text-muted)] text-[10px] font-medium uppercase tracking-wide flex items-center gap-1">
                                                    <Clock size={10} /> Ends in {overview.featured.endsIn}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Volume</p>
                                            <p className="text-sm font-bold text-[var(--text-main)]">{overview.featured.volume}</p>
                                        </div>
                                    </div>

                                    <h2 className="font-serif text-2xl md:text-3xl text-[var(--text-main)] mb-8 max-w-lg leading-tight">
                                        {overview.featured.question}
                                    </h2>

                                    <div className="flex flex-col md:flex-row gap-4">
                                        <button className="flex-1 relative group/btn overflow-hidden rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] p-4 hover:border-[var(--emerald-300)]/50 transition-all">
                                            <div className="flex justify-between items-end relative z-10">
                                                <span className="text-sm font-bold text-[var(--text-main)] group-hover/btn:text-[var(--emerald-300)] transition-colors">YES</span>
                                                <span className="text-xl font-light text-[var(--emerald-300)]">{overview.featured.yes}%</span>
                                            </div>
                                            <div className="absolute bottom-0 left-0 h-1 bg-[var(--emerald-300)] opacity-50 w-[34%]"></div>
                                        </button>
                                        <button className="flex-1 relative group/btn overflow-hidden rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-color)] p-4 hover:border-[var(--rose-400)]/50 transition-all">
                                            <div className="flex justify-between items-end relative z-10">
                                                <span className="text-sm font-bold text-[var(--text-main)] group-hover/btn:text-[var(--rose-400)] transition-colors">NO</span>
                                                <span className="text-xl font-light text-[var(--rose-400)]">{overview.featured.no}%</span>
                                            </div>
                                            <div className="absolute bottom-0 left-0 h-1 bg-[var(--rose-400)] opacity-50 w-[66%]"></div>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-[var(--text-muted)]">
                                    {isLoading ? 'Loading markets...' : 'No featured markets yet.'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-4 border-b border-[var(--border-color)] pb-4">
                        {['Trending', 'Pop Culture', 'Personal', 'Crypto'].map((tab, i) => (
                            <button
                                key={tab}
                                className={`text-sm ${i === 0 ? 'text-[var(--text-main)] font-medium border-b-2 border-[var(--amber-200)] -mb-[17px] pb-4' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'} transition-colors`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Market List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!isLoading && overview.active.length === 0 && (
                            <div className="text-sm text-[var(--text-muted)]">No markets available yet.</div>
                        )}
                        {overview.active.map((market) => (
                            <div key={market.id} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-3">
                                    {market.hot && <span className="text-[10px] text-[var(--amber-200)] flex items-center gap-1"><Zap size={10} /> HOT</span>}
                                    <span className="text-[10px] text-[var(--text-muted)] ml-auto">{market.volume} Vol</span>
                                </div>
                                <h3 className="font-serif text-lg text-[var(--text-main)] leading-snug mb-4 group-hover:text-[var(--text-accent)] transition-colors">
                                    {market.question}
                                </h3>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-[var(--bg-main)] rounded py-2 text-center text-xs text-[var(--text-muted)] border border-[var(--border-color)]">
                                        Yes <span className="text-[var(--emerald-300)] ml-1">{market.yes}%</span>
                                    </div>
                                    <div className="flex-1 bg-[var(--bg-main)] rounded py-2 text-center text-xs text-[var(--text-muted)] border border-[var(--border-color)]">
                                        No <span className="text-[var(--rose-400)] ml-1">{market.no}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar: My Positions */}
                <div className="lg:w-80 space-y-6">
                    <div className="bg-[var(--glass-panel)] backdrop-blur-md border border-[var(--border-color)] rounded-2xl p-6 sticky top-24">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Your Positions</h3>
                            <Activity size={14} className="text-[var(--text-muted)]" />
                        </div>

                        <div className="space-y-4">
                            {!isLoading && overview.positions.length === 0 && (
                                <div className="text-xs text-[var(--text-muted)]">No positions yet.</div>
                            )}
                            {overview.positions.map((pos) => (
                                <div key={pos.id} className="pb-4 border-b border-[var(--border-color)] last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-medium text-[var(--text-main)] line-clamp-1">{pos.market}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className={`font-bold ${pos.position === 'YES' ? 'text-[var(--emerald-300)]' : 'text-[var(--rose-400)]'}`}>
                                            {pos.position} <span className="font-normal text-[var(--text-muted)]">x{pos.shares}</span>
                                        </span>
                                        <span className={`${pos.status === 'up' ? 'text-[var(--emerald-300)]' : 'text-[var(--rose-400)]'}`}>
                                            {pos.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-6 py-3 border border-[var(--border-color)] rounded-xl text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)] transition-all">
                            View Portfolio
                        </button>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--amber-200)]/10 to-transparent border border-[var(--amber-200)]/20 text-center">
                        <Users size={24} className="text-[var(--amber-200)] mx-auto mb-3" />
                        <h4 className="font-serif text-[var(--text-main)] mb-2">Create a Market</h4>
                        <p className="text-xs text-[var(--text-muted)] mb-4">Bet on your own life events with friends.</p>
                        <button className="w-full py-2 bg-[var(--amber-200)] text-black rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity">
                            New Pool
                        </button>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
