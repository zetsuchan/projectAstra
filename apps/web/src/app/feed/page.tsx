'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Globe, Sun, Moon, ThumbsUp, MessageSquare, Share2, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { OrbitVisual } from '@/components/ui/orbit-visual';
import type { FeedItem, TrendingTopic } from '@/lib/api-types';
import { fetchFeedItems, fetchTrendingTopics } from '@/lib/api-client';

export default function FeedPage() {
    const [theme, setTheme] = useState('dark');
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
        document.documentElement.classList.toggle('light');
    };

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            const [items, topics] = await Promise.all([
                fetchFeedItems(),
                fetchTrendingTopics(),
            ]);

            if (isMounted) {
                setFeedItems(items);
                setTrendingTopics(topics);
                setIsLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const typeStyles: Record<string, string> = {
        personal: 'bg-blue-400',
        tea: 'bg-[var(--amber-200)]',
        prompt: 'bg-emerald-300',
        celebrity: 'bg-purple-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`relative min-h-screen flex flex-col ${theme}`}
        >
            <OrbitVisual theme={theme} />

            {/* Feed Header */}
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
                            <Globe size={18} className="text-[var(--text-main)]" />
                        </div>
                        <div>
                            <h2 className="font-serif text-lg leading-none text-[var(--text-main)]">Cosmic Feed</h2>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">Live Updates</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-main)]"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </header>

            {/* Content Layout */}
            <div className="flex-1 max-w-7xl mx-auto w-full flex relative z-10 pt-6 px-4 md:px-6 gap-8">

                {/* Main Feed Stream */}
                <div className="flex-1 max-w-2xl space-y-6 pb-20">
                    {!isLoading && feedItems.length === 0 && (
                        <div className="text-sm text-[var(--text-muted)] text-center">
                            No feed items yet.
                        </div>
                    )}
                    {feedItems.map((post) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 hover:bg-[var(--bg-card-hover)] transition-colors">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${typeStyles[post.type] ?? 'bg-blue-400'}`} />
                                        <span className="text-xs font-medium text-[var(--text-main)] uppercase tracking-wide">{post.type}</span>
                                    </div>
                                    <span className="text-xs text-[var(--text-muted)]">
                                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                                    </span>
                                </div>
                                <h3 className="font-serif text-lg text-[var(--text-main)] mb-2">{post.title}</h3>
                                <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                                    {post.body}
                                </p>
                                <div className="flex gap-4 border-t border-[var(--border-color)] pt-4">
                                    <button className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--rose-300)] transition-colors">
                                        <ThumbsUp size={14} />
                                    </button>
                                    <button className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                                        <MessageSquare size={14} /> Comment
                                    </button>
                                    <button className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors ml-auto">
                                        <Share2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Right Sidebar (Trending) - Desktop Only */}
                <div className="hidden lg:block w-80 sticky top-24 h-fit space-y-6">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4 flex items-center gap-2">
                            <Star size={12} className="text-[var(--amber-200)]" /> Trending Topics
                        </h3>
                        {trendingTopics.length === 0 ? (
                            <p className="text-xs text-[var(--text-muted)]">No trending topics yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {trendingTopics.map((topic) => (
                                    <li key={topic.id} className="flex items-center justify-between group cursor-pointer">
                                        <span className="text-sm text-[var(--text-main)] group-hover:text-[var(--rose-300)] transition-colors">#{topic.label}</span>
                                        {topic.volume !== undefined && (
                                            <span className="text-xs text-[var(--text-muted)]">{topic.volume.toLocaleString()}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--rose-900)]/20 to-transparent border border-[var(--rose-400)]/10 text-center">
                        <Sparkles size={24} className="text-[var(--rose-300)] mx-auto mb-3" />
                        <h4 className="font-serif text-[var(--text-main)] mb-2">Want deeper insights?</h4>
                        <p className="text-xs text-[var(--text-muted)] mb-4">Chat with Astra to see how these transits affect you personally.</p>
                        <Link
                            href="/chat"
                            className="w-full py-2 bg-[var(--text-main)] text-[var(--bg-main)] rounded-full text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform inline-block"
                        >
                            Open Chat
                        </Link>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
