'use client';

import { TarotCardDisplay } from './tarot-card';
import type { DrawnCard } from '@/lib/api-types';

export function TarotSpread({
    cards,
    autoReveal = false,
}: {
    cards: DrawnCard[];
    autoReveal?: boolean;
}) {
    if (cards.length === 1) {
        return (
            <div className="flex justify-center py-4">
                <TarotCardDisplay card={cards[0]} autoReveal={autoReveal} />
            </div>
        );
    }

    // Three-card layout
    return (
        <div className="flex justify-center gap-4 md:gap-8 py-4">
            {cards.map((card, i) => (
                <TarotCardDisplay
                    key={card.cardId}
                    card={card}
                    autoReveal={autoReveal}
                    delay={i}
                />
            ))}
        </div>
    );
}
