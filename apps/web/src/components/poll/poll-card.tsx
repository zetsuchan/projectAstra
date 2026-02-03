'use client';

import { useState, useOptimistic, useCallback } from 'react';
import { BarChart3, Clock, Sparkles, Users } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { PollOption } from './poll-option';
import { SignBreakdownModal } from './sign-breakdown-modal';
import { usePollSubscription } from '@/lib/pusher-client';
import { votePoll, fetchPollSignBreakdown } from '@/lib/api-client';
import type { Poll, PollSignBreakdown } from '@/lib/api-types';

interface PollCardProps {
    poll: Poll;
    onVote?: (pollId: string, optionId: string) => void;
    authFetch?: typeof fetch;
}

type OptimisticPoll = Poll & { isOptimistic?: boolean };

export function PollCard({ poll: initialPoll, onVote, authFetch }: PollCardProps) {
    const { authenticated, login, getAccessToken } = usePrivy();
    const [poll, setPoll] = useState<OptimisticPoll>(initialPoll);
    const [isVoting, setIsVoting] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [breakdown, setBreakdown] = useState<PollSignBreakdown | null>(null);
    const [loadingBreakdown, setLoadingBreakdown] = useState(false);

    // Optimistic update for immediate feedback
    const [optimisticPoll, addOptimisticVote] = useOptimistic(
        poll,
        (currentPoll: OptimisticPoll, optionId: string): OptimisticPoll => {
            const newOptions = currentPoll.options.map((opt) => {
                const newCount = opt.id === optionId ? opt.voteCount + 1 : opt.voteCount;
                return { ...opt, voteCount: newCount };
            });

            const newTotal = newOptions.reduce((sum, o) => sum + o.voteCount, 0);
            const optionsWithPercentage = newOptions.map((opt) => ({
                ...opt,
                percentage: newTotal > 0 ? Math.round((opt.voteCount / newTotal) * 100) : 0,
            }));

            return {
                ...currentPoll,
                options: optionsWithPercentage,
                totalVotes: newTotal,
                userVote: optionId,
                showResults: true,
                isOptimistic: true,
            };
        }
    );

    // Subscribe to real-time updates
    usePollSubscription(poll.id, (data) => {
        setPoll((current) => ({
            ...current,
            totalVotes: data.totalVotes,
            options: current.options.map((opt) => {
                const updated = data.options.find((o) => o.id === opt.id);
                if (updated) {
                    return {
                        ...opt,
                        voteCount: updated.voteCount,
                        percentage: updated.percentage,
                    };
                }
                return opt;
            }),
        }));
    });

    const handleVote = useCallback(
        async (optionId: string) => {
            if (!authenticated) {
                login();
                return;
            }

            if (optimisticPoll.userVote || isVoting) {
                return;
            }

            setIsVoting(true);

            // Generate idempotency key
            const idempotencyKey = `${poll.id}-${optionId}-${Date.now()}`;

            // Apply optimistic update
            addOptimisticVote(optionId);

            try {
                // Get auth token and create authenticated fetch
                const token = await getAccessToken();
                const fetcher = authFetch ?? ((url: RequestInfo | URL, init?: RequestInit) =>
                    fetch(url, {
                        ...init,
                        headers: {
                            ...init?.headers,
                            Authorization: `Bearer ${token}`,
                        },
                    })
                );

                const result = await votePoll(poll.id, optionId, idempotencyKey, fetcher);

                if (result.success) {
                    // Update confirmed state
                    setPoll((current) => ({
                        ...current,
                        userVote: optionId,
                        showResults: true,
                    }));
                    onVote?.(poll.id, optionId);
                } else {
                    // Revert optimistic update on failure
                    console.error('Vote failed:', result.error);
                    setPoll(initialPoll);
                }
            } catch (error) {
                console.error('Vote error:', error);
                setPoll(initialPoll);
            } finally {
                setIsVoting(false);
            }
        },
        [authenticated, login, optimisticPoll.userVote, isVoting, poll.id, addOptimisticVote, getAccessToken, authFetch, onVote, initialPoll]
    );

    const handleShowBreakdown = async () => {
        if (!optimisticPoll.userVote) return;

        setShowBreakdown(true);

        if (!breakdown && !loadingBreakdown) {
            setLoadingBreakdown(true);
            try {
                const token = await getAccessToken();
                const fetcher = authFetch ?? ((url: RequestInfo | URL, init?: RequestInit) =>
                    fetch(url, {
                        ...init,
                        headers: {
                            ...init?.headers,
                            Authorization: `Bearer ${token}`,
                        },
                    })
                );
                const data = await fetchPollSignBreakdown(poll.id, fetcher);
                setBreakdown(data);
            } catch (error) {
                console.error('Failed to fetch breakdown:', error);
            } finally {
                setLoadingBreakdown(false);
            }
        }
    };

    const formatExpiresIn = (expiresAt?: string) => {
        if (!expiresAt) return null;

        const diff = new Date(expiresAt).getTime() - Date.now();
        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h left`;
        return 'Ending soon';
    };

    const expiresIn = formatExpiresIn(optimisticPoll.expiresAt);
    const hasVoted = !!optimisticPoll.userVote;

    return (
        <>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 hover:bg-[var(--bg-card-hover)] transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-xs font-medium text-[var(--text-main)] uppercase tracking-wide">Poll</span>
                        {optimisticPoll.featured && (
                            <span className="flex items-center gap-1 text-xs text-[var(--amber-200)]">
                                <Sparkles size={10} />
                                Featured
                            </span>
                        )}
                    </div>
                    {expiresIn && (
                        <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <Clock size={12} />
                            {expiresIn}
                        </span>
                    )}
                </div>

                {/* Question */}
                <h3 className="font-serif text-lg text-[var(--text-main)] mb-2">{optimisticPoll.question}</h3>
                {optimisticPoll.description && (
                    <p className="text-sm text-[var(--text-muted)] mb-4">{optimisticPoll.description}</p>
                )}

                {/* Astro tags */}
                {optimisticPoll.astroTags && optimisticPoll.astroTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {optimisticPoll.astroTags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 text-xs rounded-full bg-[var(--rose-900)]/30 text-[var(--rose-300)] border border-[var(--rose-400)]/20"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Options */}
                <div role="radiogroup" aria-label={optimisticPoll.question} className="space-y-2 mb-4">
                    {optimisticPoll.options.map((option) => (
                        <PollOption
                            key={option.id}
                            id={option.id}
                            text={option.text}
                            voteCount={option.voteCount}
                            percentage={option.percentage}
                            isSelected={optimisticPoll.userVote === option.id}
                            showResults={optimisticPoll.showResults}
                            disabled={hasVoted || isVoting}
                            onSelect={handleVote}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                    <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <Users size={14} />
                        {optimisticPoll.totalVotes.toLocaleString()} vote{optimisticPoll.totalVotes !== 1 ? 's' : ''}
                    </span>

                    {hasVoted && (
                        <button
                            onClick={handleShowBreakdown}
                            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--rose-300)] transition-colors"
                        >
                            <BarChart3 size={14} />
                            View by sign
                        </button>
                    )}

                    {!authenticated && !hasVoted && (
                        <button
                            onClick={() => login()}
                            className="text-xs text-[var(--rose-300)] hover:text-[var(--rose-200)] transition-colors"
                        >
                            Sign in to vote
                        </button>
                    )}
                </div>
            </div>

            {/* Sign Breakdown Modal */}
            <SignBreakdownModal
                isOpen={showBreakdown}
                onClose={() => setShowBreakdown(false)}
                breakdown={breakdown}
                options={optimisticPoll.options}
                question={optimisticPoll.question}
            />
        </>
    );
}
