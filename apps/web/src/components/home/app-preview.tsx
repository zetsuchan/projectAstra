'use client';
import Link from 'next/link';
import { PhoneMockup } from './phone-mockup';

export const AppPreview = () => {
    return (
        <section className="min-h-screen py-24 flex flex-col md:flex-row items-center justify-center gap-20 px-6 md:px-20 overflow-hidden relative">
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[var(--rose-900)]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="md:w-1/2 z-10">
                <h2 className="font-serif text-4xl md:text-6xl mb-6 text-[var(--text-main)] transition-colors duration-500">
                    Astrology for the <br />
                    <span className="text-[var(--text-accent)] italic">culturally fluent.</span>
                </h2>
                <p className="font-sans text-[var(--text-muted)] leading-relaxed mb-8 max-w-md transition-colors duration-500">
                    Your daily feed isn't just horoscopes. It's astrological commentary on current events,
                    prediction markets for pop culture, and a rolling diary that connects the dots between your mood and the moon.
                </p>
                <ul className="space-y-4 font-sans text-sm text-[var(--text-muted)] mb-10 transition-colors duration-500">
                    <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-[var(--rose-400)] rounded-full" />
                        Zero "wellness" jargon
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-[var(--rose-400)] rounded-full" />
                        Bet on pop culture outcomes
                    </li>
                    <li className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-[var(--rose-400)] rounded-full" />
                        AI that remembers your history
                    </li>
                </ul>
                <Link href="/chat"
                    className="group relative px-8 py-4 bg-[var(--rose-200)] text-[var(--cosmic-950)] font-serif italic text-lg rounded-full overflow-hidden transition-transform hover:scale-105 inline-block"
                >
                    <span className="relative z-10 group-hover:text-black transition-colors">Start the Chat</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen" />
                </Link>
            </div>

            <div className="md:w-1/2 flex justify-center z-10">
                <PhoneMockup />
            </div>
        </section>
    );
};
