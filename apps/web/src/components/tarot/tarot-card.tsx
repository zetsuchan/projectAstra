'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TAROT_DECK_MAP } from '@/lib/tarot-deck';
import type { DrawnCard } from '@/lib/api-types';

export function TarotCardDisplay({
    card,
    autoReveal = false,
    delay = 0,
}: {
    card: DrawnCard;
    autoReveal?: boolean;
    delay?: number;
}) {
    const [isFlipped, setIsFlipped] = useState(autoReveal);
    const deckCard = TAROT_DECK_MAP.get(card.cardId);

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Position label */}
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                {card.position}
            </span>

            {/* Card container with 3D perspective */}
            <motion.div
                className="relative cursor-pointer"
                style={{ perspective: 1000, width: 140, height: 220 }}
                onClick={() => !isFlipped && setIsFlipped(true)}
                initial={autoReveal ? {} : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay * 0.2, duration: 0.4 }}
            >
                <motion.div
                    className="w-full h-full relative"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                    {/* Card Back */}
                    <div
                        className="absolute inset-0 rounded-xl border border-[var(--border-color)] overflow-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="w-full h-full bg-gradient-to-br from-[var(--rose-900)] via-[#1a0a2e] to-[var(--lilac-300)]/30 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full border-2 border-[var(--rose-400)]/30 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full border border-[var(--lilac-300)]/40 flex items-center justify-center text-[var(--rose-300)] text-2xl">
                                    &#x2726;
                                </div>
                            </div>
                        </div>
                        {!isFlipped && (
                            <div className="absolute bottom-3 left-0 right-0 text-center">
                                <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] animate-pulse">
                                    Tap to reveal
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Card Front */}
                    <div
                        className="absolute inset-0 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden flex flex-col items-center justify-center p-3 text-center"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <div className={`${card.reversed ? 'rotate-180' : ''}`}>
                            <div className="text-3xl mb-2">
                                {deckCard?.arcana === 'major' ? '&#x2726;' : getSuitSymbol(deckCard?.suit)}
                            </div>
                            <p className="font-serif text-sm text-[var(--text-main)] leading-tight">
                                {deckCard?.name ?? card.cardId}
                            </p>
                        </div>

                        {card.reversed && (
                            <span className="absolute bottom-2 text-[8px] uppercase tracking-wider text-red-400">
                                Reversed
                            </span>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

function getSuitSymbol(suit: string | null | undefined): string {
    switch (suit) {
        case 'wands': return '\u2660';
        case 'cups': return '\u2665';
        case 'swords': return '\u2663';
        case 'pentacles': return '\u2666';
        default: return '\u2726';
    }
}
