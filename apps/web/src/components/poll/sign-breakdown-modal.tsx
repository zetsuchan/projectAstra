'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { PollSignBreakdown, PollOption } from '@/lib/api-types';

const ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_EMOJIS: Record<string, string> = {
    Aries: '\u2648',
    Taurus: '\u2649',
    Gemini: '\u264a',
    Cancer: '\u264b',
    Leo: '\u264c',
    Virgo: '\u264d',
    Libra: '\u264e',
    Scorpio: '\u264f',
    Sagittarius: '\u2650',
    Capricorn: '\u2651',
    Aquarius: '\u2652',
    Pisces: '\u2653',
};

interface SignBreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    breakdown: PollSignBreakdown | null;
    options: PollOption[];
    question: string;
}

export function SignBreakdownModal({
    isOpen,
    onClose,
    breakdown,
    options,
    question,
}: SignBreakdownModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Focus trap
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    if (!breakdown) return null;

    // Get ordered signs that have votes
    const signsWithVotes = ZODIAC_SIGNS.filter((sign) => breakdown[sign]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        ref={modalRef}
                        tabIndex={-1}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[80vh] overflow-y-auto bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border-color)] p-4 flex items-center justify-between">
                            <div>
                                <h2 className="font-serif text-lg text-[var(--text-main)]">How Each Sign Voted</h2>
                                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{question}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {signsWithVotes.length === 0 ? (
                                <p className="text-center text-sm text-[var(--text-muted)] py-8">
                                    No zodiac data available yet.
                                </p>
                            ) : (
                                signsWithVotes.map((sign) => {
                                    const signData = breakdown[sign];
                                    const totalForSign = Object.values(signData).reduce((a, b) => a + b, 0);

                                    return (
                                        <div key={sign} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{SIGN_EMOJIS[sign]}</span>
                                                <span className="font-medium text-[var(--text-main)]">{sign}</span>
                                                <span className="text-xs text-[var(--text-muted)]">
                                                    ({totalForSign} vote{totalForSign !== 1 ? 's' : ''})
                                                </span>
                                            </div>

                                            <div className="flex gap-1 h-6 rounded-lg overflow-hidden bg-[var(--bg-main)]">
                                                {options.map((opt, idx) => {
                                                    const count = signData[opt.id] || 0;
                                                    const pct = totalForSign > 0 ? (count / totalForSign) * 100 : 0;

                                                    if (pct === 0) return null;

                                                    const colors = [
                                                        'bg-[var(--rose-400)]',
                                                        'bg-[var(--amber-200)]',
                                                        'bg-emerald-400',
                                                        'bg-blue-400',
                                                    ];

                                                    return (
                                                        <motion.div
                                                            key={opt.id}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.5, delay: 0.1 }}
                                                            className={`${colors[idx % colors.length]} relative group`}
                                                            title={`${opt.text}: ${Math.round(pct)}%`}
                                                        >
                                                            {pct > 15 && (
                                                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                                                                    {Math.round(pct)}%
                                                                </span>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {/* Legend */}
                            {signsWithVotes.length > 0 && (
                                <div className="pt-4 border-t border-[var(--border-color)]">
                                    <p className="text-xs text-[var(--text-muted)] mb-2">Legend:</p>
                                    <div className="flex flex-wrap gap-3">
                                        {options.map((opt, idx) => {
                                            const colors = [
                                                'bg-[var(--rose-400)]',
                                                'bg-[var(--amber-200)]',
                                                'bg-emerald-400',
                                                'bg-blue-400',
                                            ];

                                            return (
                                                <div key={opt.id} className="flex items-center gap-1.5">
                                                    <div className={`w-3 h-3 rounded ${colors[idx % colors.length]}`} />
                                                    <span className="text-xs text-[var(--text-main)]">{opt.text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
