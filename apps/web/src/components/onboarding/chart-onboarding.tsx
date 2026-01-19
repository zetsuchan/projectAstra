'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Star } from 'lucide-react';
import { useAuthenticatedFetch } from '@/lib/auth';

interface ChartOnboardingProps {
    onComplete: () => void;
    onSkip?: () => void;
}

const ZODIAC_SIGNS = [
    { sign: 'aries', symbol: '♈', dates: 'Mar 21 - Apr 19' },
    { sign: 'taurus', symbol: '♉', dates: 'Apr 20 - May 20' },
    { sign: 'gemini', symbol: '♊', dates: 'May 21 - Jun 20' },
    { sign: 'cancer', symbol: '♋', dates: 'Jun 21 - Jul 22' },
    { sign: 'leo', symbol: '♌', dates: 'Jul 23 - Aug 22' },
    { sign: 'virgo', symbol: '♍', dates: 'Aug 23 - Sep 22' },
    { sign: 'libra', symbol: '♎', dates: 'Sep 23 - Oct 22' },
    { sign: 'scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21' },
    { sign: 'sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21' },
    { sign: 'capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19' },
    { sign: 'aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18' },
    { sign: 'pisces', symbol: '♓', dates: 'Feb 19 - Mar 20' },
];

export function ChartOnboarding({ onComplete, onSkip }: ChartOnboardingProps) {
    const authFetch = useAuthenticatedFetch();
    const [step, setStep] = useState(0);
    const [sunSign, setSunSign] = useState<string | null>(null);
    const [moonSign, setMoonSign] = useState<string | null>(null);
    const [risingSign, setRisingSign] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!sunSign) return;

        setIsSubmitting(true);
        try {
            const res = await authFetch('/api/onboarding/chart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sunSign,
                    moonSign,
                    risingSign,
                }),
            });

            if (res.ok) {
                onComplete();
            }
        } catch (err) {
            console.error('Failed to save chart:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSignGrid = (
        selected: string | null,
        onSelect: (sign: string) => void,
        allowSkip?: boolean
    ) => (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
                {ZODIAC_SIGNS.map(({ sign, symbol, dates }) => (
                    <button
                        key={sign}
                        onClick={() => onSelect(sign)}
                        className={`p-3 rounded-xl border transition-all ${
                            selected === sign
                                ? 'border-[var(--rose-400)] bg-[var(--rose-400)]/10 text-[var(--rose-300)]'
                                : 'border-[var(--border-color)] hover:border-[var(--rose-400)]/50 text-[var(--text-main)]'
                        }`}
                    >
                        <div className="text-2xl mb-1">{symbol}</div>
                        <div className="text-xs font-medium capitalize">{sign}</div>
                        <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{dates}</div>
                    </button>
                ))}
            </div>
            {allowSkip && (
                <button
                    onClick={() => onSelect('')}
                    className="w-full py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                    I don't know
                </button>
            )}
        </div>
    );

    const steps = [
        {
            title: "What's your Sun sign?",
            subtitle: "This is based on your birthday",
            content: renderSignGrid(sunSign, (sign) => {
                setSunSign(sign);
                setTimeout(() => setStep(1), 300);
            }),
        },
        {
            title: "What's your Moon sign?",
            subtitle: "This governs your emotions and inner world",
            content: renderSignGrid(moonSign, (sign) => {
                setMoonSign(sign || null);
                setTimeout(() => setStep(2), 300);
            }, true),
        },
        {
            title: "What's your Rising sign?",
            subtitle: "Also called Ascendant - how others see you",
            content: renderSignGrid(risingSign, (sign) => {
                setRisingSign(sign || null);
                setTimeout(() => setStep(3), 300);
            }, true),
        },
        {
            title: "You're all set!",
            subtitle: sunSign ? `A ${sunSign.charAt(0).toUpperCase() + sunSign.slice(1)}... interesting.` : '',
            content: (
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[var(--rose-400)] to-[var(--lilac-300)] flex items-center justify-center">
                        <Star size={32} className="text-white" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[var(--text-main)]">
                            {sunSign && <span className="capitalize">{sunSign} Sun</span>}
                            {moonSign && <span className="text-[var(--text-muted)]"> · {moonSign} Moon</span>}
                            {risingSign && <span className="text-[var(--text-muted)]"> · {risingSign} Rising</span>}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                            Astra will use this to personalize your readings
                        </p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] font-medium hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Start Chatting'}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-main)]/90 backdrop-blur-md p-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--rose-400)] to-[var(--lilac-300)] flex items-center justify-center">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-serif text-lg text-[var(--text-main)]">Welcome to Astra</h2>
                        <p className="text-xs text-[var(--text-muted)]">Let's get to know you</p>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex gap-1 mb-6">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                                i <= step ? 'bg-[var(--rose-400)]' : 'bg-[var(--border-color)]'
                            }`}
                        />
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <div className="text-center mb-6">
                            <h3 className="font-serif text-xl text-[var(--text-main)]">{steps[step].title}</h3>
                            <p className="text-sm text-[var(--text-muted)] mt-1">{steps[step].subtitle}</p>
                        </div>
                        {steps[step].content}
                    </motion.div>
                </AnimatePresence>

                {/* Back button */}
                {step > 0 && step < 3 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                        ← Back
                    </button>
                )}

                {/* Skip link */}
                {onSkip && step === 0 && (
                    <button
                        onClick={onSkip}
                        className="mt-4 w-full text-center text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                        Skip for now
                    </button>
                )}
            </motion.div>
        </motion.div>
    );
}
