'use client';
import { MessageSquare, Heart, TrendingUp } from 'lucide-react';
import { FeatureCard } from './feature-card';

export const Features = () => {
    const features = [
        {
            title: "Contextual AI",
            subtitle: "She references your past chats, diary entries, and transits to give advice that actually tracks.",
            icon: MessageSquare,
            colorVar: "rose-300",
            delay: 0
        },
        {
            title: "Relationship Realism",
            subtitle: "Add your boyfriend or bestie. We don't just do 'compatibility scores'—we roast the dynamic.",
            icon: Heart,
            colorVar: "lilac-300",
            delay: 0.1
        },
        {
            title: "Prediction Markets",
            subtitle: "Put your intuition to the test. Bet on celebrity breakups, pop culture chaos, and your own life.",
            icon: TrendingUp,
            colorVar: "amber-200",
            delay: 0.2
        }
    ];

    return (
        <section
            className="relative py-32 px-6 md:px-20 transition-colors duration-500 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]"
        >
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                    {features.map((f, i) => (
                        <FeatureCard
                            key={i}
                            title={f.title}
                            subtitle={f.subtitle}
                            icon={f.icon}
                            colorVar={f.colorVar}
                            delay={f.delay}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
