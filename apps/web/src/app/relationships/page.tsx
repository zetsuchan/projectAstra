'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sun, Moon, Plus, Heart, Users, X, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { OrbitVisual } from '@/components/ui/orbit-visual';
import { useAuthenticatedFetch } from '@/lib/auth';
import { RelationshipCard } from '@/components/relationships/relationship-card';
import {
    fetchRelationships, createRelationship, fetchRelationship, deleteRelationship,
} from '@/lib/api-client';
import type { Relationship } from '@/lib/api-types';

const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const RELATIONSHIP_TYPES = [
    { value: 'boyfriend', label: 'Boyfriend' },
    { value: 'girlfriend', label: 'Girlfriend' },
    { value: 'partner', label: 'Partner' },
    { value: 'ex', label: 'Ex' },
    { value: 'family', label: 'Family' },
    { value: 'best_friend', label: 'Best Friend' },
    { value: 'situationship', label: 'Situationship' },
    { value: 'custom', label: 'Other' },
];

export default function RelationshipsPage() {
    const { ready, authenticated, user, login, logout } = usePrivy();
    const authFetch = useAuthenticatedFetch();
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
        document.documentElement.classList.toggle('light');
    };

    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    // Add form state
    const [addStep, setAddStep] = useState(0);
    const [newName, setNewName] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [newType, setNewType] = useState('');
    const [newSunSign, setNewSunSign] = useState('');
    const [newMoonSign, setNewMoonSign] = useState('');
    const [newRisingSign, setNewRisingSign] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const loadRelationships = useCallback(async () => {
        if (!authenticated) {
            setIsLoading(false);
            return;
        }
        const data = await fetchRelationships(authFetch);
        setRelationships(data);
        setIsLoading(false);
    }, [authenticated, authFetch]);

    useEffect(() => {
        loadRelationships();
    }, [loadRelationships]);

    const handleViewDetail = async (rel: Relationship) => {
        setSelectedRelationship(rel);
        setIsLoadingDetail(true);

        // Fetch full detail (may trigger compatibility generation)
        const detail = await fetchRelationship(rel.id, authFetch);
        if (detail) {
            setSelectedRelationship(detail);
            // Also update in list
            setRelationships(prev => prev.map(r => r.id === detail.id ? detail : r));
        }
        setIsLoadingDetail(false);
    };

    const handleAdd = async () => {
        if (!newName.trim() || !newType || isSaving) return;
        setIsSaving(true);

        const result = await createRelationship({
            personName: newName.trim(),
            label: newLabel.trim() || newName.trim(),
            type: newType,
            sunSign: newSunSign || undefined,
            moonSign: newMoonSign || undefined,
            risingSign: newRisingSign || undefined,
        }, authFetch);

        if (result) {
            setRelationships(prev => [result, ...prev]);
            resetAddForm();
        }

        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        const ok = await deleteRelationship(id, authFetch);
        if (ok) {
            setRelationships(prev => prev.filter(r => r.id !== id));
            if (selectedRelationship?.id === id) {
                setSelectedRelationship(null);
            }
        }
    };

    const resetAddForm = () => {
        setShowAdd(false);
        setAddStep(0);
        setNewName('');
        setNewLabel('');
        setNewType('');
        setNewSunSign('');
        setNewMoonSign('');
        setNewRisingSign('');
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
                            <Users size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-serif text-lg leading-none text-[var(--text-main)]">Relationships</h2>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1">Your cosmic connections</p>
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
                <div className="max-w-3xl mx-auto space-y-6">

                    {!authenticated && !isLoading && (
                        <div className="text-center py-12 text-[var(--text-muted)]">
                            <Users size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="mb-4">Sign in to track your cosmic connections</p>
                            <button onClick={() => login()} className="px-6 py-2 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-sm font-medium hover:scale-105 transition-transform">
                                Sign In
                            </button>
                        </div>
                    )}

                    {/* Add button */}
                    {authenticated && !showAdd && (
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setShowAdd(true)}
                            className="w-full p-6 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/50 hover:bg-[var(--bg-card)] transition-colors flex items-center justify-center gap-3 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        >
                            <Plus size={20} />
                            <span className="text-sm font-medium">Add Relationship</span>
                        </motion.button>
                    )}

                    {/* Add form - step by step */}
                    <AnimatePresence>
                        {showAdd && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-5"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-serif text-[var(--text-main)]">Add a person</h3>
                                    <button onClick={resetAddForm} className="p-1 rounded-full hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)]">
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Step 0: Name & Label */}
                                {addStep === 0 && (
                                    <div className="space-y-3">
                                        <input
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder="Their name"
                                            className="w-full bg-transparent border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--rose-400)]"
                                            autoFocus
                                        />
                                        <input
                                            value={newLabel}
                                            onChange={e => setNewLabel(e.target.value)}
                                            placeholder="Label (e.g. 'My person', 'College bestie')"
                                            className="w-full bg-transparent border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--rose-400)]"
                                        />
                                        <div className="flex flex-wrap gap-2">
                                            {RELATIONSHIP_TYPES.map(t => (
                                                <button
                                                    key={t.value}
                                                    onClick={() => setNewType(t.value)}
                                                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                                                        newType === t.value
                                                            ? 'bg-[var(--rose-400)]/20 border border-[var(--rose-400)]/50 text-[var(--rose-300)]'
                                                            : 'border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                                    }`}
                                                >
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setAddStep(1)}
                                            disabled={!newName.trim() || !newType}
                                            className="w-full py-3 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            Next: Their signs <ArrowRight size={14} />
                                        </button>
                                    </div>
                                )}

                                {/* Step 1: Signs (optional) */}
                                {addStep === 1 && (
                                    <div className="space-y-4">
                                        <p className="text-xs text-[var(--text-muted)]">Do you know their signs? (optional — skip if unsure)</p>

                                        {[
                                            { label: 'Sun Sign', value: newSunSign, set: setNewSunSign },
                                            { label: 'Moon Sign', value: newMoonSign, set: setNewMoonSign },
                                            { label: 'Rising Sign', value: newRisingSign, set: setNewRisingSign },
                                        ].map(({ label, value, set }) => (
                                            <div key={label}>
                                                <p className="text-xs text-[var(--text-muted)] mb-2">{label}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {ZODIAC_SIGNS.map(sign => (
                                                        <button
                                                            key={sign}
                                                            onClick={() => set(value === sign ? '' : sign)}
                                                            className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                                                                value === sign
                                                                    ? 'bg-[var(--rose-400)]/20 border border-[var(--rose-400)]/50 text-[var(--rose-300)]'
                                                                    : 'border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                                            }`}
                                                        >
                                                            {sign}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex gap-3 pt-2">
                                            <button onClick={() => setAddStep(0)} className="px-4 py-2 text-sm text-[var(--text-muted)]">
                                                Back
                                            </button>
                                            <button
                                                onClick={handleAdd}
                                                disabled={isSaving}
                                                className="flex-1 py-3 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-sm font-medium disabled:opacity-50"
                                            >
                                                {isSaving ? 'Adding...' : 'Add Person'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Relationships Grid */}
                    {isLoading ? (
                        <div className="text-center text-[var(--text-muted)] py-12">Loading...</div>
                    ) : authenticated && relationships.length === 0 && !showAdd ? (
                        <div className="text-center text-[var(--text-muted)] py-12">
                            <Heart size={32} className="mx-auto mb-3 opacity-50" />
                            <p>No relationships added yet. Add someone to get a compatibility read!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {relationships.map(rel => (
                                <RelationshipCard
                                    key={rel.id}
                                    relationship={rel}
                                    onClick={() => handleViewDetail(rel)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Sheet */}
            <AnimatePresence>
                {selectedRelationship && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center"
                        onClick={() => setSelectedRelationship(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full md:max-w-lg bg-[var(--bg-main)] rounded-t-3xl md:rounded-3xl border border-[var(--border-color)] max-h-[85vh] overflow-y-auto"
                        >
                            <div className="p-6 space-y-5">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="font-serif text-xl text-[var(--text-main)]">{selectedRelationship.personName}</h2>
                                        <p className="text-sm text-[var(--text-muted)]">{selectedRelationship.label}</p>
                                    </div>
                                    <button onClick={() => setSelectedRelationship(null)} className="p-2 rounded-full hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)]">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Signs */}
                                <div className="flex gap-4 text-sm text-[var(--text-muted)]">
                                    {selectedRelationship.sunSign && <span>Sun: <span className="text-[var(--text-main)]">{selectedRelationship.sunSign}</span></span>}
                                    {selectedRelationship.moonSign && <span>Moon: <span className="text-[var(--text-main)]">{selectedRelationship.moonSign}</span></span>}
                                    {selectedRelationship.risingSign && <span>Rising: <span className="text-[var(--text-main)]">{selectedRelationship.risingSign}</span></span>}
                                </div>

                                {/* Compatibility */}
                                {isLoadingDetail ? (
                                    <div className="text-center py-8 text-[var(--text-muted)]">
                                        <Sparkles size={24} className="mx-auto mb-2 animate-pulse text-[var(--rose-400)]" />
                                        <p className="text-sm">Generating compatibility read...</p>
                                    </div>
                                ) : selectedRelationship.compatibilitySnapshot ? (
                                    <div className="space-y-4">
                                        {/* Score */}
                                        <div className="flex items-center gap-4">
                                            <div className={`text-3xl font-bold ${
                                                selectedRelationship.compatibilitySnapshot.score >= 75 ? 'text-green-400' :
                                                selectedRelationship.compatibilitySnapshot.score >= 50 ? 'text-[var(--amber-200)]' : 'text-red-400'
                                            }`}>
                                                {selectedRelationship.compatibilitySnapshot.score}
                                            </div>
                                            <div className="flex-1 h-2 rounded-full bg-[var(--border-color)] overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        selectedRelationship.compatibilitySnapshot.score >= 75 ? 'bg-green-400' :
                                                        selectedRelationship.compatibilitySnapshot.score >= 50 ? 'bg-[var(--amber-200)]' : 'bg-red-400'
                                                    }`}
                                                    style={{ width: `${selectedRelationship.compatibilitySnapshot.score}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        <p className="text-sm text-[var(--text-main)] leading-relaxed">
                                            {selectedRelationship.compatibilitySnapshot.summary}
                                        </p>

                                        {/* Strengths */}
                                        {selectedRelationship.compatibilitySnapshot.strengths.length > 0 && (
                                            <div>
                                                <h4 className="text-xs uppercase tracking-wide text-green-400 mb-2">Strengths</h4>
                                                <ul className="space-y-1.5">
                                                    {selectedRelationship.compatibilitySnapshot.strengths.map((s, i) => (
                                                        <li key={i} className="text-sm text-[var(--text-muted)] flex gap-2">
                                                            <span className="text-green-400">+</span> {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Tensions */}
                                        {selectedRelationship.compatibilitySnapshot.tensions.length > 0 && (
                                            <div>
                                                <h4 className="text-xs uppercase tracking-wide text-red-400 mb-2">Tensions</h4>
                                                <ul className="space-y-1.5">
                                                    {selectedRelationship.compatibilitySnapshot.tensions.map((t, i) => (
                                                        <li key={i} className="text-sm text-[var(--text-muted)] flex gap-2">
                                                            <span className="text-red-400">-</span> {t}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Tip */}
                                        {selectedRelationship.compatibilitySnapshot.tip && (
                                            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                                                <div className="flex items-center gap-1.5 text-[10px] text-[var(--lilac-300)] uppercase tracking-wide mb-1.5">
                                                    <Sparkles size={10} />
                                                    Lumi's tip
                                                </div>
                                                <p className="text-sm text-[var(--text-main)] italic">
                                                    {selectedRelationship.compatibilitySnapshot.tip}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-[var(--text-muted)] text-sm">
                                        <p>Add their sun sign to get a compatibility reading.</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-2 border-t border-[var(--border-color)]">
                                    <button
                                        onClick={() => {
                                            handleDelete(selectedRelationship.id);
                                        }}
                                        className="px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
