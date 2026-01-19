'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Sun, Moon, Plus, BookOpen, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { OrbitVisual } from '@/components/ui/orbit-visual';

interface DiaryEntry {
    id: string;
    title: string | null;
    body: string;
    mood: string | null;
    moodTags: string[] | null;
    aiReflection: string | null;
    createdAt: string;
}

export default function DiaryPage() {
    const { ready, authenticated, user, login, logout } = usePrivy();
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
        document.documentElement.classList.toggle('light');
    };

    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewEntry, setShowNewEntry] = useState(false);
    const [newEntryBody, setNewEntryBody] = useState('');
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

    const moodOptions = ['happy', 'anxious', 'calm', 'frustrated', 'hopeful', 'sad', 'energetic', 'confused'];

    useEffect(() => {
        // TODO: Fetch diary entries from API
        setIsLoading(false);
        // Mock data for now
        setEntries([
            {
                id: '1',
                title: null,
                body: 'Had a really intense conversation with Alex today. Mars square Venus is no joke.',
                mood: 'anxious',
                moodTags: ['anxious', 'hopeful'],
                aiReflection: 'This transit often brings relationship tensions to the surface. Your awareness of it is half the battle.',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: '2',
                title: 'New moon intentions',
                body: 'Setting intentions for this lunar cycle: focus on my art, spend less time doomscrolling, actually text back.',
                mood: 'hopeful',
                moodTags: ['hopeful', 'calm'],
                aiReflection: null,
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            },
        ]);
    }, []);

    const handleSaveEntry = async () => {
        if (!newEntryBody.trim()) return;

        // TODO: POST to API
        const newEntry: DiaryEntry = {
            id: crypto.randomUUID(),
            title: null,
            body: newEntryBody,
            mood: selectedMoods[0] || null,
            moodTags: selectedMoods.length > 0 ? selectedMoods : null,
            aiReflection: null,
            createdAt: new Date().toISOString(),
        };

        setEntries(prev => [newEntry, ...prev]);
        setNewEntryBody('');
        setSelectedMoods([]);
        setShowNewEntry(false);
    };

    const toggleMood = (mood: string) => {
        setSelectedMoods(prev =>
            prev.includes(mood)
                ? prev.filter(m => m !== mood)
                : [...prev, mood]
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--lilac-300)] to-[var(--rose-400)] flex items-center justify-center shadow-lg shadow-[var(--lilac-300)]/20">
                            <BookOpen size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-serif text-lg leading-none text-[var(--text-main)]">Diary</h2>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">Your cosmic journal</p>
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
                        <button
                            onClick={() => logout()}
                            className="hidden md:block px-4 py-1.5 border border-[var(--border-color)] rounded-full text-xs uppercase tracking-widest hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-all"
                        >
                            Sign Out
                        </button>
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
            </header>

            {/* Main Content */}
            <div className="flex-1 relative z-10 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                <div className="max-w-2xl mx-auto space-y-6">

                    {/* New Entry Button / Form */}
                    {!showNewEntry ? (
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setShowNewEntry(true)}
                            className="w-full p-6 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/50 hover:bg-[var(--bg-card)] transition-colors flex items-center justify-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        >
                            <Plus size={20} />
                            <span className="text-sm font-medium">New Entry</span>
                        </motion.button>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-4"
                        >
                            <textarea
                                value={newEntryBody}
                                onChange={(e) => setNewEntryBody(e.target.value)}
                                placeholder="What's on your mind today?"
                                className="w-full h-32 bg-transparent border-none focus:ring-0 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none resize-none"
                                autoFocus
                            />

                            {/* Mood Tags */}
                            <div className="space-y-2">
                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">How are you feeling?</p>
                                <div className="flex flex-wrap gap-2">
                                    {moodOptions.map(mood => (
                                        <button
                                            key={mood}
                                            onClick={() => toggleMood(mood)}
                                            className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                                                selectedMoods.includes(mood)
                                                    ? 'bg-[var(--rose-400)]/20 border border-[var(--rose-400)]/50 text-[var(--rose-300)]'
                                                    : 'border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                            }`}
                                        >
                                            {mood}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowNewEntry(false);
                                        setNewEntryBody('');
                                        setSelectedMoods([]);
                                    }}
                                    className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEntry}
                                    disabled={!newEntryBody.trim()}
                                    className="px-6 py-2 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-sm font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Entries List */}
                    {isLoading ? (
                        <div className="text-center text-[var(--text-muted)] py-12">Loading entries...</div>
                    ) : entries.length === 0 ? (
                        <div className="text-center text-[var(--text-muted)] py-12">
                            <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
                            <p>No entries yet. Start writing!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {entries.map((entry, index) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                            <Calendar size={12} />
                                            {formatDate(entry.createdAt)}
                                        </div>
                                        {entry.moodTags && entry.moodTags.length > 0 && (
                                            <div className="flex gap-1.5">
                                                {entry.moodTags.slice(0, 2).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--rose-400)]/10 text-[var(--rose-300)]"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {entry.title && (
                                        <h3 className="font-serif text-[var(--text-main)] mb-2">{entry.title}</h3>
                                    )}

                                    <p className="text-sm text-[var(--text-main)] leading-relaxed line-clamp-3">
                                        {entry.body}
                                    </p>

                                    {entry.aiReflection && (
                                        <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                                            <div className="flex items-center gap-1.5 text-[10px] text-[var(--lilac-300)] uppercase tracking-wide mb-1.5">
                                                <Sparkles size={10} />
                                                Astra's reflection
                                            </div>
                                            <p className="text-xs text-[var(--text-muted)] italic">
                                                {entry.aiReflection}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
