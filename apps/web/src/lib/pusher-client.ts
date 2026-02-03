'use client';

/**
 * Client-side Pusher subscription hook for real-time updates.
 */

import { useEffect, useRef } from 'react';
import PusherClient from 'pusher-js';
import type { PollVoteEvent } from './pusher';

// Singleton Pusher client
let pusherInstance: PusherClient | null = null;

function getPusherClient(): PusherClient | null {
  if (pusherInstance) return pusherInstance;

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'us2';

  if (!key) {
    console.warn('[Pusher Client] Missing NEXT_PUBLIC_PUSHER_KEY');
    return null;
  }

  pusherInstance = new PusherClient(key, {
    cluster,
  });

  return pusherInstance;
}

/**
 * Subscribe to real-time poll vote updates.
 * @param pollId - The poll ID to subscribe to
 * @param onVote - Callback when a vote is received
 */
export function usePollSubscription(
  pollId: string | null,
  onVote: (data: PollVoteEvent) => void
): void {
  const callbackRef = useRef(onVote);

  // Update ref in effect to avoid accessing during render
  useEffect(() => {
    callbackRef.current = onVote;
  });

  useEffect(() => {
    if (!pollId) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `poll-${pollId}`;
    const channel = pusher.subscribe(channelName);

    const handler = (data: PollVoteEvent) => {
      callbackRef.current(data);
    };

    channel.bind('vote', handler);

    return () => {
      channel.unbind('vote', handler);
      pusher.unsubscribe(channelName);
    };
  }, [pollId]);
}
