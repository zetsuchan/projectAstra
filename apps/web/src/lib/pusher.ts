/**
 * Server-side Pusher client for real-time updates.
 */

import Pusher from 'pusher';

// Lazy-initialized Pusher client
let pusherClient: Pusher | null = null;

function getPusherClient(): Pusher | null {
  if (pusherClient) return pusherClient;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'us2';

  if (!appId || !key || !secret) {
    console.warn('[Pusher] Missing PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_KEY, or PUSHER_SECRET');
    return null;
  }

  pusherClient = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusherClient;
}

export type PollVoteEvent = {
  optionId: string;
  totalVotes: number;
  options: Array<{
    id: string;
    voteCount: number;
    percentage: number;
  }>;
};

/**
 * Trigger a poll vote event to all subscribers.
 */
export async function triggerPollVote(pollId: string, data: PollVoteEvent): Promise<void> {
  const pusher = getPusherClient();
  if (!pusher) {
    console.warn('[Pusher] Client not available, skipping real-time update');
    return;
  }

  try {
    await pusher.trigger(`poll-${pollId}`, 'vote', data);
  } catch (error) {
    console.error('[Pusher] Failed to trigger event:', error);
  }
}
