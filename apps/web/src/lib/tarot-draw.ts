import { TAROT_DECK, type TarotCard } from './tarot-deck';

type DrawnCard = TarotCard & { reversed: boolean };

export function drawCards(count: number): DrawnCard[] {
    // Create a copy of the deck
    const deck = [...TAROT_DECK];

    // Fisher-Yates shuffle using crypto-secure random
    const randomValues = new Uint32Array(deck.length);
    crypto.getRandomValues(randomValues);

    for (let i = deck.length - 1; i > 0; i--) {
        const j = randomValues[i] % (i + 1);
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Draw the first `count` cards with random reversal
    const reversalValues = new Uint8Array(count);
    crypto.getRandomValues(reversalValues);

    return deck.slice(0, count).map((card, i) => ({
        ...card,
        reversed: reversalValues[i] < 128, // ~50% chance
    }));
}
