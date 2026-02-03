'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PollOptionProps {
    id: string;
    text: string;
    voteCount: number;
    percentage: number;
    isSelected: boolean;
    showResults: boolean;
    disabled: boolean;
    onSelect: (id: string) => void;
}

export function PollOption({
    id,
    text,
    voteCount,
    percentage,
    isSelected,
    showResults,
    disabled,
    onSelect,
}: PollOptionProps) {
    const handleClick = () => {
        if (!disabled) {
            onSelect(id);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            onSelect(id);
        }
    };

    return (
        <div
            role="radio"
            aria-checked={isSelected}
            tabIndex={disabled ? -1 : 0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={`
                relative overflow-hidden rounded-xl border transition-all cursor-pointer
                ${isSelected
                    ? 'border-[var(--rose-400)] bg-[var(--rose-900)]/20'
                    : 'border-[var(--border-color)] hover:border-[var(--text-muted)] bg-[var(--bg-main)]'
                }
                ${disabled ? 'cursor-default' : ''}
            `}
        >
            {/* Background progress bar */}
            {showResults && (
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`
                        absolute inset-y-0 left-0
                        ${isSelected ? 'bg-[var(--rose-400)]/20' : 'bg-[var(--bg-card-hover)]'}
                    `}
                />
            )}

            {/* Content */}
            <div className="relative flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    {/* Radio indicator */}
                    <div
                        className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                            ${isSelected
                                ? 'border-[var(--rose-400)] bg-[var(--rose-400)]'
                                : 'border-[var(--text-muted)]'
                            }
                        `}
                    >
                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>

                    {/* Option text */}
                    <span className="text-sm text-[var(--text-main)]">{text}</span>
                </div>

                {/* Results */}
                {showResults && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--text-muted)]">{voteCount.toLocaleString()}</span>
                        <span className="font-medium text-[var(--text-main)]">{percentage}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}
