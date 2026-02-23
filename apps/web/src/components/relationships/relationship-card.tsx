'use client';

import { motion } from 'framer-motion';
import { Heart, Star, Zap } from 'lucide-react';
import type { Relationship } from '@/lib/api-types';

const ZODIAC_SYMBOLS: Record<string, string> = {
    aries: '\u2648', taurus: '\u2649', gemini: '\u264A', cancer: '\u264B',
    leo: '\u264C', virgo: '\u264D', libra: '\u264E', scorpio: '\u264F',
    sagittarius: '\u2650', capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
};

function getZodiacSymbol(sign: string | null): string {
    if (!sign) return '?';
    return ZODIAC_SYMBOLS[sign.toLowerCase()] ?? sign.charAt(0).toUpperCase();
}

const TYPE_LABELS: Record<string, string> = {
    boyfriend: 'Boyfriend',
    girlfriend: 'Girlfriend',
    partner: 'Partner',
    ex: 'Ex',
    family: 'Family',
    best_friend: 'Best Friend',
    situationship: 'Situationship',
    custom: 'Other',
};

export function RelationshipCard({
    relationship,
    onClick,
}: {
    relationship: Relationship;
    onClick: () => void;
}) {
    const score = relationship.compatibilitySnapshot?.score;

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors text-left"
        >
            <div className="flex items-start gap-4">
                {/* Zodiac Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--rose-400)] to-[var(--lilac-300)] flex items-center justify-center text-white text-xl flex-shrink-0">
                    {getZodiacSymbol(relationship.sunSign)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-[var(--text-main)] truncate">{relationship.personName}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--rose-400)]/10 text-[var(--rose-300)] flex-shrink-0">
                            {TYPE_LABELS[relationship.type] ?? relationship.type}
                        </span>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] mb-2">{relationship.label}</p>

                    {/* Signs row */}
                    <div className="flex gap-3 text-[10px] text-[var(--text-muted)]">
                        {relationship.sunSign && <span>Sun: {relationship.sunSign}</span>}
                        {relationship.moonSign && <span>Moon: {relationship.moonSign}</span>}
                        {relationship.risingSign && <span>Rising: {relationship.risingSign}</span>}
                    </div>
                </div>

                {/* Compatibility score */}
                {typeof score === 'number' && (
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className={`text-lg font-bold ${
                            score >= 75 ? 'text-green-400' : score >= 50 ? 'text-[var(--amber-200)]' : 'text-red-400'
                        }`}>
                            {score}
                        </div>
                        <span className="text-[9px] text-[var(--text-muted)] uppercase">match</span>
                    </div>
                )}
            </div>

            {/* Score bar */}
            {typeof score === 'number' && (
                <div className="mt-3 h-1 rounded-full bg-[var(--border-color)] overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                            score >= 75 ? 'bg-green-400' : score >= 50 ? 'bg-[var(--amber-200)]' : 'bg-red-400'
                        }`}
                    />
                </div>
            )}
        </motion.button>
    );
}
