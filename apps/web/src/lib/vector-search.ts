import { db } from '@/db';
import { memories, knowledgeBase } from '@/db/schema';
import { sql, eq, and, desc } from 'drizzle-orm';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate an embedding vector using OpenAI's text-embedding-3-small model.
 * Uses OpenAI directly (not via OpenRouter) for embeddings.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.warn('[Vector] Missing OPENAI_API_KEY — skipping embedding generation');
        return null;
    }

    try {
        const res = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: EMBEDDING_MODEL,
                input: text.slice(0, 8000), // Truncate to avoid token limits
            }),
        });

        if (!res.ok) {
            console.error('[Vector] OpenAI embedding error:', res.status);
            return null;
        }

        const data = await res.json();
        return data?.data?.[0]?.embedding ?? null;
    } catch (error) {
        console.error('[Vector] Embedding generation failed:', error);
        return null;
    }
}

/**
 * Search user memories by semantic similarity.
 * Uses cosine distance with HNSW index, scoped by userId.
 */
export async function searchMemories(
    userId: string,
    query: string,
    limit = 5,
): Promise<Array<{ memoryId: string; content: string; type: string; similarity: number }>> {
    const embedding = await generateEmbedding(query);
    if (!embedding) return [];

    try {
        // Set higher ef_search for filtered queries
        await db.execute(sql`SET LOCAL hnsw.ef_search = 200`);

        const results = await db
            .select({
                memoryId: memories.memoryId,
                content: memories.content,
                type: memories.type,
                similarity: sql<number>`1 - (${memories.embedding} <=> ${sql`${JSON.stringify(embedding)}::vector`})`,
            })
            .from(memories)
            .where(eq(memories.userId, userId))
            .orderBy(sql`${memories.embedding} <=> ${sql`${JSON.stringify(embedding)}::vector`}`)
            .limit(limit);

        return results.filter((r) => r.similarity > 0.3); // Filter low-relevance results
    } catch (error) {
        console.error('[Vector] Memory search failed:', error);
        return [];
    }
}

/**
 * Search the knowledge base corpus by semantic similarity.
 * Not scoped by user — this is global astrology knowledge.
 */
export async function searchKnowledgeBase(
    query: string,
    limit = 5,
    category?: string,
): Promise<Array<{ chunkId: string; title: string; content: string; category: string; similarity: number }>> {
    const embedding = await generateEmbedding(query);
    if (!embedding) return [];

    try {
        const conditions = [];
        if (category) {
            conditions.push(eq(knowledgeBase.category, category as typeof knowledgeBase.$inferSelect.category));
        }

        const results = await db
            .select({
                chunkId: knowledgeBase.chunkId,
                title: knowledgeBase.title,
                content: knowledgeBase.content,
                category: knowledgeBase.category,
                similarity: sql<number>`1 - (${knowledgeBase.embedding} <=> ${sql`${JSON.stringify(embedding)}::vector`})`,
            })
            .from(knowledgeBase)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(sql`${knowledgeBase.embedding} <=> ${sql`${JSON.stringify(embedding)}::vector`}`)
            .limit(limit);

        return results.filter((r) => r.similarity > 0.25);
    } catch (error) {
        console.error('[Vector] Knowledge base search failed:', error);
        return [];
    }
}
