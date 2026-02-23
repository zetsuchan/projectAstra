import { TAROT_DECK_MAP } from './tarot-deck';
import type { DrawnCard } from '@/lib/api-types';

export function buildTarotPrompt(
    cards: DrawnCard[],
    spread: string,
    context: string | null,
): string {
    const cardDescriptions = cards.map((card) => {
        const deckCard = TAROT_DECK_MAP.get(card.cardId);
        const meaning = deckCard?.meaning;
        const orientation = card.reversed ? 'Reversed' : 'Upright';
        const traditionalMeaning = card.reversed ? meaning?.reversed : meaning?.upright;

        return `**${card.position}**: ${deckCard?.name ?? card.cardId} (${orientation})
Traditional meaning: ${traditionalMeaning ?? 'Unknown'}`;
    }).join('\n\n');

    const spreadLabel = spread === 'three-card' ? 'Three-Card Spread (Past / Present / Future)' : 'Daily Single Card';

    let prompt = `The user pulled a ${spreadLabel}:\n\n${cardDescriptions}`;

    if (context) {
        prompt += `\n\nThe user's question/context: "${context}"`;
    }

    prompt += `\n\nGive a personalized tarot reading in Lumi's voice. Reference the traditional meaning but make it feel personal and relevant. Keep it ${spread === 'single' ? '3-4 sentences' : '5-7 sentences'}.`;

    return prompt;
}
