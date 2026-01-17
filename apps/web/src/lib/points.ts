/**
 * Points System (PLACEHOLDER)
 *
 * NOTE: This is a basic ledger implementation. The actual airdrop points
 * program will be designed separately - see docs/roadmap-research.md for
 * research on Blur/Jupiter/Hyperliquid-style airdrop points.
 *
 * This file provides basic point tracking infrastructure that can be
 * adapted for the final airdrop model.
 */

import { db } from '@/db';
import { users, pointTransactions, fraudAttempts } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export type PointTransactionType =
  | 'signup_bonus'
  | 'daily_bonus'
  | 'market_win'
  | 'market_bet'
  | 'referral_bonus'
  | 'transfer_in'
  | 'transfer_out'
  | 'admin_adjustment';

interface TransactionParams {
  userId: string;
  amount: number;
  type: PointTransactionType;
  description: string;
  idempotencyKey: string;
  metadata?: {
    marketId?: string;
    toUserId?: string;
    fromUserId?: string;
    relatedTransactionId?: string;
    ipAddress?: string;
    adminUserId?: string;
  };
}

interface TransferParams {
  fromUserId: string;
  toUserId: string;
  amount: number;
  idempotencyKey: string;
  ipAddress?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const POINTS_CONFIG = {
  SIGNUP_BONUS: 1000,           // Points given on account creation
  DAILY_BONUS: 100,             // Points for daily claim
  REFERRAL_BONUS: 500,          // Points for referring a friend
  MIN_TRANSFER: 10,             // Minimum transfer amount
  MAX_TRANSFER: 10000,          // Maximum single transfer
  RATE_LIMIT_TRANSFERS: 10,     // Max transfers per hour
  RATE_LIMIT_WINDOW_MS: 3600000, // 1 hour
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Award points to a user (credits their balance)
 */
export async function awardPoints(params: TransactionParams): Promise<{ success: boolean; transaction?: any; error?: string }> {
  const { userId, amount, type, description, idempotencyKey, metadata } = params;

  // Validate
  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' };
  }

  try {
    // Check idempotency - return existing if already processed
    const existing = await db.query.pointTransactions.findFirst({
      where: eq(pointTransactions.idempotencyKey, idempotencyKey),
    });

    if (existing) {
      return { success: true, transaction: existing };
    }

    // Execute transaction
    const result = await db.transaction(async (tx) => {
      // Get current balance with row lock
      const [user] = await tx
        .select({ pointsBalance: users.pointsBalance })
        .from(users)
        .where(eq(users.userId, userId))
        .for('update');

      if (!user) {
        throw new Error('User not found');
      }

      const newBalance = user.pointsBalance + amount;

      // Insert ledger entry
      const [transaction] = await tx
        .insert(pointTransactions)
        .values({
          userId,
          amount,
          type,
          balanceAfter: newBalance,
          description,
          metadata,
          idempotencyKey,
        })
        .returning();

      // Update cached balance
      await tx
        .update(users)
        .set({
          pointsBalance: newBalance,
          pointsUpdatedAt: new Date(),
        })
        .where(eq(users.userId, userId));

      return transaction;
    });

    return { success: true, transaction: result };
  } catch (error) {
    console.error('[Points] Award error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Deduct points from a user (debits their balance)
 */
export async function deductPoints(params: TransactionParams): Promise<{ success: boolean; transaction?: any; error?: string }> {
  const { userId, amount, type, description, idempotencyKey, metadata } = params;

  // Validate
  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' };
  }

  try {
    // Check idempotency
    const existing = await db.query.pointTransactions.findFirst({
      where: eq(pointTransactions.idempotencyKey, idempotencyKey),
    });

    if (existing) {
      return { success: true, transaction: existing };
    }

    // Execute transaction
    const result = await db.transaction(async (tx) => {
      // Get current balance with row lock
      const [user] = await tx
        .select({ pointsBalance: users.pointsBalance })
        .from(users)
        .where(eq(users.userId, userId))
        .for('update');

      if (!user) {
        throw new Error('User not found');
      }

      // Check sufficient balance
      if (user.pointsBalance < amount) {
        // Log fraud attempt
        await tx.insert(fraudAttempts).values({
          userId,
          reason: 'insufficient_balance',
          action: `Attempted to deduct ${amount} points`,
          metadata: { amount },
        });
        throw new Error('Insufficient balance');
      }

      const newBalance = user.pointsBalance - amount;

      // Insert ledger entry (negative amount for debit)
      const [transaction] = await tx
        .insert(pointTransactions)
        .values({
          userId,
          amount: -amount, // Negative for deduction
          type,
          balanceAfter: newBalance,
          description,
          metadata,
          idempotencyKey,
        })
        .returning();

      // Update cached balance
      await tx
        .update(users)
        .set({
          pointsBalance: newBalance,
          pointsUpdatedAt: new Date(),
        })
        .where(eq(users.userId, userId));

      return transaction;
    });

    return { success: true, transaction: result };
  } catch (error) {
    console.error('[Points] Deduct error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Transfer points between users
 */
export async function transferPoints(params: TransferParams): Promise<{ success: boolean; error?: string }> {
  const { fromUserId, toUserId, amount, idempotencyKey, ipAddress } = params;

  // Validations
  if (amount < POINTS_CONFIG.MIN_TRANSFER) {
    return { success: false, error: `Minimum transfer is ${POINTS_CONFIG.MIN_TRANSFER} points` };
  }
  if (amount > POINTS_CONFIG.MAX_TRANSFER) {
    return { success: false, error: `Maximum transfer is ${POINTS_CONFIG.MAX_TRANSFER} points` };
  }
  if (fromUserId === toUserId) {
    return { success: false, error: 'Cannot transfer to yourself' };
  }

  // Rate limit check
  const recentTransfers = await db.query.pointTransactions.findMany({
    where: and(
      eq(pointTransactions.userId, fromUserId),
      eq(pointTransactions.type, 'transfer_out'),
      gte(pointTransactions.createdAt, new Date(Date.now() - POINTS_CONFIG.RATE_LIMIT_WINDOW_MS))
    ),
  });

  if (recentTransfers.length >= POINTS_CONFIG.RATE_LIMIT_TRANSFERS) {
    await db.insert(fraudAttempts).values({
      userId: fromUserId,
      reason: 'rate_limit_exceeded',
      action: 'transfer',
      metadata: { ipAddress, amount },
    });
    return { success: false, error: 'Transfer rate limit exceeded. Try again later.' };
  }

  try {
    await db.transaction(async (tx) => {
      // Deduct from sender
      const deductResult = await deductPoints({
        userId: fromUserId,
        amount,
        type: 'transfer_out',
        description: `Transfer to user`,
        idempotencyKey: `${idempotencyKey}-out`,
        metadata: { toUserId, ipAddress },
      });

      if (!deductResult.success) {
        throw new Error(deductResult.error);
      }

      // Credit to receiver
      const awardResult = await awardPoints({
        userId: toUserId,
        amount,
        type: 'transfer_in',
        description: `Transfer from user`,
        idempotencyKey: `${idempotencyKey}-in`,
        metadata: {
          fromUserId,
          relatedTransactionId: deductResult.transaction?.transactionId,
        },
      });

      if (!awardResult.success) {
        throw new Error(awardResult.error);
      }
    });

    return { success: true };
  } catch (error) {
    console.error('[Points] Transfer error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// BONUS FUNCTIONS
// ============================================================================

/**
 * Award signup bonus to new user
 */
export async function awardSignupBonus(userId: string): Promise<{ success: boolean; error?: string }> {
  const result = await awardPoints({
    userId,
    amount: POINTS_CONFIG.SIGNUP_BONUS,
    type: 'signup_bonus',
    description: 'Welcome bonus for signing up!',
    idempotencyKey: `signup-bonus-${userId}`,
  });

  return result;
}

/**
 * Claim daily bonus (once per 24 hours)
 */
export async function claimDailyBonus(userId: string): Promise<{ success: boolean; error?: string }> {
  // Check last claim time
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
    columns: { dailyBonusLastClaimedAt: true },
  });

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const now = new Date();
  const lastClaim = user.dailyBonusLastClaimedAt;

  if (lastClaim) {
    const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastClaim < 24) {
      const hoursRemaining = Math.ceil(24 - hoursSinceLastClaim);
      return { success: false, error: `Daily bonus available in ${hoursRemaining} hours` };
    }
  }

  // Award bonus
  const result = await awardPoints({
    userId,
    amount: POINTS_CONFIG.DAILY_BONUS,
    type: 'daily_bonus',
    description: 'Daily login bonus',
    idempotencyKey: `daily-bonus-${userId}-${now.toISOString().split('T')[0]}`,
  });

  if (result.success) {
    // Update last claim time
    await db
      .update(users)
      .set({ dailyBonusLastClaimedAt: now })
      .where(eq(users.userId, userId));
  }

  return result;
}

// ============================================================================
// MARKET INTEGRATION
// ============================================================================

/**
 * Place a bet using points
 */
export async function placeBetWithPoints(
  userId: string,
  marketId: string,
  amount: number,
  side: 'yes' | 'no'
): Promise<{ success: boolean; error?: string }> {
  return deductPoints({
    userId,
    amount,
    type: 'market_bet',
    description: `Bet ${amount} points on ${side.toUpperCase()}`,
    idempotencyKey: `bet-${marketId}-${userId}-${Date.now()}`,
    metadata: { marketId },
  });
}

/**
 * Award winnings from a resolved market
 */
export async function awardMarketWinnings(
  userId: string,
  marketId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  return awardPoints({
    userId,
    amount,
    type: 'market_win',
    description: `Won ${amount} points from prediction market`,
    idempotencyKey: `market-win-${marketId}-${userId}`,
    metadata: { marketId },
  });
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get user's current balance
 */
export async function getBalance(userId: string): Promise<number | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
    columns: { pointsBalance: true },
  });
  return user?.pointsBalance ?? null;
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit = 50
): Promise<typeof pointTransactions.$inferSelect[]> {
  return db.query.pointTransactions.findMany({
    where: eq(pointTransactions.userId, userId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
  });
}

/**
 * Reconcile cached balance with ledger (for admin/cron)
 */
export async function reconcileBalance(userId: string): Promise<{ cached: number; calculated: number; match: boolean }> {
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
    columns: { pointsBalance: true },
  });

  const [result] = await db
    .select({ sum: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(pointTransactions)
    .where(eq(pointTransactions.userId, userId));

  const cached = user?.pointsBalance ?? 0;
  const calculated = Number(result.sum);

  if (cached !== calculated) {
    console.warn(`[Points] Balance mismatch for ${userId}: cached=${cached}, calculated=${calculated}`);
    // Auto-fix
    await db
      .update(users)
      .set({ pointsBalance: calculated })
      .where(eq(users.userId, userId));
  }

  return { cached, calculated, match: cached === calculated };
}
