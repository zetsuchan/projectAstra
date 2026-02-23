'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sun, Moon, Plus, BookOpen, Calendar, Sparkles, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { OrbitVisual } from '@/components/ui/orbit-visual';
import { useAuthenticatedFetch } from '@/lib/auth';
import { fetchDiaryEntries, createDiaryEntry, deleteDiaryEntry, fetchDiaryEntry } from '@/lib/api-client';
import type { DiaryEntry } from '@/lib/api-types';

export default function DiaryPage() {
    const { ready, authenticated, user, login, logout } = usePrivy();
    const authFetch = useAuthenticatedFetch();
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
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const moodOptions = ['happy', 'anxious', 'calm', 'frustrated', 'hopeful', 'sad', 'energetic', 'confused'];

    const loadEntries = useCallback(async (cursor?: string) => {
        if (!authenticated) {
            setIsLoading(false);
            return;
        }

        const result = await fetchDiaryEntries(cursor, 20, authFetch);
        if (cursor) {
            setEntries(prev => [...prev, ...result.entries]);
        } else {
            setEntries(result.entries);
        }
        setNextCursor(result.nextCursor);
        setIsLoading(false);
    }, [authenticated, authFetch]);

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    const handleSaveEntry = async () => {
        if (!newEntryBody.trim() || isSaving) return;
        setIsSaving(true);

        const entry = await createDiaryEntry(
            newEntryBody,
            selectedMoods.length > 0 ? selectedMoods : undefined,
            undefined,
            authFetch,
        );

        if (entry) {
            setEntries(prev => [entry, ...prev]);
            setNewEntryBody('');
            setSelectedMoods([]);
            setShowNewEntry(false);

            // Poll for AI reflection after a few seconds
            pollForReflection(entry.id);
        }

        setIsSaving(false);
    };

    const pollForReflection = async (entryId: string) => {
        // Check for AI reflection after 4s and 8s
        for (const delay of [4000, 8000]) {
            await new Promise(resolve => setTimeout(resolve, delay));
            const updated = await fetchDiaryEntry(entryId, authFetch);
            if (updated?.aiReflection) {
                setEntries(prev =>
                    prev.map(e => e.id === entryId ? { ...e, aiReflection: updated.aiReflection } : e)
                );
                return;
            }
        }
    };

    const handleDeleteEntry = async (entryId: string) => {
        const ok = await deleteDiaryEntry(entryId, authFetch);
        if (ok) {
            setEntries(prev => prev.filter(e => e.id !== entryId));
        }
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

                    {/* Auth gate */}
                    {!authenticated && !isLoading && (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="mb-4">Sign in to start your cosmic journal</p>
                            <button
                                onClick={() => login()}
                                className="px-6 py-2 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-sm font-medium hover:scale-105 transition-transform"
                            >
                                Sign In
                            </button>
                        </div>
                    )}

                    {/* New Entry Button / Form */}
                    {authenticated && (
                        <>
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
                                            disabled={!newEntryBody.trim() || isSaving}
                                            className="px-6 py-2 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-sm font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                        >
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}

                    {/* Entries List */}
                    {isLoading ? (
                        <div className="text-center text-[var(--text-muted)] py-12">Loading entries...</div>
                    ) : authenticated && entries.length === 0 ? (
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
                                    className="group p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                            <Calendar size={12} />
                                            {formatDate(entry.createdAt)}
                                        </div>
                                        <div className="flex items-center gap-2">
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
                                            <button
                                                onClick={() => handleDeleteEntry(entry.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-all"
                                                title="Delete entry"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
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

                            {/* Load more */}
                            {nextCursor && (
                                <button
                                    onClick={() => loadEntries(nextCursor)}
                                    className="w-full py-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                                >
                                    Load more entries
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
