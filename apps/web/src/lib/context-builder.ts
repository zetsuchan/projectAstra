import { db } from '@/db';
import { users, charts, relationships, diaryEntries, chatThreads } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export type UserContext = {
    user: typeof users.$inferSelect | null;
    chart: typeof charts.$inferSelect | null;
    relationships: (typeof relationships.$inferSelect)[];
    recentDiaries: (typeof diaryEntries.$inferSelect)[];
    threadSummary: string | null;
};

/**
 * Load all structured context for a user to include in the AI system prompt.
 * This is "Tier 1" of the memory system - zero embedding cost, just DB queries.
 */
export async function loadUserContext(userId: string, threadId?: string): Promise<UserContext> {
    const [userData, chartData, relationshipsData, recentDiaries, threadData] = await Promise.all([
        db.select().from(users).where(eq(users.userId, userId)).limit(1),
        db.select().from(charts).where(eq(charts.userId, userId)).limit(1),
        db.select().from(relationships).where(eq(relationships.userId, userId)),
        db.select()
            .from(diaryEntries)
            .where(eq(diaryEntries.userId, userId))
            .orderBy(desc(diaryEntries.createdAt))
            .limit(3), // Last 3 diary entries for recent context
        threadId
            ? db.select().from(chatThreads).where(eq(chatThreads.threadId, threadId)).limit(1)
            : Promise.resolve([]),
    ]);

    return {
        user: userData[0] ?? null,
        chart: chartData[0] ?? null,
        relationships: relationshipsData,
        recentDiaries,
        threadSummary: threadData[0]?.summary ?? null,
    };
}

/**
 * Format user context into a system prompt section.
 * Returns empty string if no context available.
 */
export function formatUserContextForPrompt(context: UserContext): string {
    const sections: string[] = [];

    // Birth chart section
    if (context.chart) {
        const chart = context.chart;
        const chartLines = [
            `Sun: ${chart.sunSign}`,
            chart.moonSign ? `Moon: ${chart.moonSign}` : null,
            chart.risingSign ? `Rising: ${chart.risingSign}` : null,
            `Birth date: ${chart.birthDate}`,
            chart.birthTime ? `Birth time: ${chart.birthTime} (${chart.birthTimePrecision ?? 'unknown precision'})` : 'Birth time: Unknown',
            chart.birthLocation ? `Location: ${chart.birthLocation}` : null,
        ].filter(Boolean);

        sections.push(`## User's Birth Chart\n${chartLines.join('\n')}`);
    }

    // Relationships section
    if (context.relationships.length > 0) {
        const relationshipLines = context.relationships.map((r) => {
            const signInfo = r.sunSign ? ` (${r.sunSign})` : '';
            return `- ${r.label}: ${r.personName}${signInfo} [${r.type}]`;
        });
        sections.push(`## User's Relationships\n${relationshipLines.join('\n')}`);
    }

    // Recent diary entries section
    if (context.recentDiaries.length > 0) {
        const diaryLines = context.recentDiaries.map((d) => {
            const date = d.createdAt.toISOString().split('T')[0];
            const mood = d.mood ? ` | Mood: ${d.mood}` : '';
            const preview = d.body.length > 150 ? d.body.substring(0, 150) + '...' : d.body;
            return `[${date}${mood}] ${d.title ?? 'Untitled'}\n${preview}`;
        });
        sections.push(`## Recent Diary Entries\n${diaryLines.join('\n\n')}`);
    }

    // Thread summary (conversation memory)
    if (context.threadSummary) {
        sections.push(`## Previous Conversation Summary\n${context.threadSummary}`);
    }

    // User preferences
    if (context.user) {
        const prefs: string[] = [];
        if (context.user.personaName) prefs.push(`Preferred name for AI: ${context.user.personaName}`);
        if (context.user.personaStyle) prefs.push(`Communication style: ${context.user.personaStyle}`);
        if (context.user.timezone) prefs.push(`Timezone: ${context.user.timezone}`);

        if (prefs.length > 0) {
            sections.push(`## User Preferences\n${prefs.join('\n')}`);
        }
    }

    if (sections.length === 0) {
        return '';
    }

    return `# User Context\n\n${sections.join('\n\n')}`;
}

/**
 * Convenience function to load and format context in one call.
 */
export async function buildUserContextPrompt(userId: string, threadId?: string): Promise<string> {
    const context = await loadUserContext(userId, threadId);
    return formatUserContextForPrompt(context);
}
