/**
 * Server-side auth utilities for API routes.
 */

import { PrivyClient } from '@privy-io/server-auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type AuthenticatedUser = {
  userId: string;
  privyId: string;
};

// Initialize Privy client (lazy to avoid build-time errors)
let privyClient: PrivyClient | null = null;

function getPrivyClient(): PrivyClient | null {
  if (privyClient) return privyClient;

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    console.warn('[Auth] Missing PRIVY_APP_ID or PRIVY_APP_SECRET');
    return null;
  }

  privyClient = new PrivyClient(appId, appSecret);
  return privyClient;
}

/**
 * Extract auth token from request headers.
 */
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Verify the Privy auth token and return the authenticated user.
 */
export async function verifyAuthToken(request: Request): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('Authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    return null;
  }

  const privy = getPrivyClient();
  if (!privy) {
    return null;
  }

  try {
    const claims = await privy.verifyAuthToken(token);
    const privyId = claims.userId;

    // Look up user in our database
    const user = await db.query.users.findFirst({
      where: eq(users.privyId, privyId),
      columns: { userId: true, privyId: true },
    });

    if (!user || !user.privyId) {
      return null;
    }

    return { userId: user.userId, privyId: user.privyId };
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}
