/**
 * Server-side auth utilities for API routes.
 *
 * TODO: Install @privy-io/server-auth for production token verification:
 *   bun add @privy-io/server-auth
 *
 * This module extracts and verifies auth tokens from request headers.
 * The userId should NEVER be trusted from request bodies.
 *
 * Environment Variables:
 * - ALLOW_DEV_USER_IMPERSONATION: Set to "true" to enable X-Dev-User-Id header
 *   for local development. Only works when NODE_ENV === 'development'.
 *   Default: off (must be explicitly enabled).
 */

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type AuthenticatedUser = {
  userId: string;
  privyId: string;
};

/**
 * Extract auth token from request headers.
 * Privy sends the token in the Authorization header as "Bearer <token>"
 */
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Verify the Privy auth token and return the authenticated user.
 *
 * In production, this should use @privy-io/server-auth:
 * ```
 * import { PrivyClient } from '@privy-io/server-auth';
 * const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_APP_SECRET!);
 * const claims = await privy.verifyAuthToken(token);
 * ```
 *
 * For now, this looks up the user by privyId passed in a dev header.
 */
export async function verifyAuthToken(request: Request): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('Authorization');
  const token = extractBearerToken(authHeader);

  // Dev-only user impersonation via X-Dev-User-Id header.
  // Requires BOTH conditions to be true:
  // 1. NODE_ENV === 'development'
  // 2. ALLOW_DEV_USER_IMPERSONATION === 'true' (explicit opt-in)
  const isDevMode = process.env.NODE_ENV === 'development';
  const isImpersonationAllowed = process.env.ALLOW_DEV_USER_IMPERSONATION === 'true';

  if (isDevMode && isImpersonationAllowed) {
    const devUserId = request.headers.get('X-Dev-User-Id');
    if (devUserId) {
      const user = await db.query.users.findFirst({
        where: eq(users.userId, devUserId),
        columns: { userId: true, privyId: true },
      });
      if (user && user.privyId) {
        return { userId: user.userId, privyId: user.privyId };
      }
    }
  }

  if (!token) {
    return null;
  }

  // TODO: Verify token with Privy server SDK
  // const privy = new PrivyClient(process.env.PRIVY_APP_ID!, process.env.PRIVY_APP_SECRET!);
  // const claims = await privy.verifyAuthToken(token);
  // Then look up user by claims.userId (which is the privyId)

  // For now, return null (unauthenticated) if no dev header
  return null;
}
