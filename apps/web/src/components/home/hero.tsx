'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { OrbitVisual } from '@/components/ui/orbit-visual';

export const Hero = () => {
    return (
        <section className="relative h-screen w-full flex flex-col justify-center px-6 md:px-20 overflow-hidden">
            <OrbitVisual />

            <div className="relative z-10 max-w-7xl w-full mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h1 className="font-serif text-[4rem] md:text-[6.5rem] lg:text-[8rem] leading-[0.9] text-[var(--text-main)] mix-blend-overlay opacity-90">
                        She knows your <br />
                        <span className="italic text-[var(--text-accent)] opacity-90 font-light">entire history.</span>
                    </h1>
                </motion.div>

                <div className="flex flex-col md:flex-row items-end md:justify-end mt-8 md:mt-4">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="md:mr-20 mb-8 md:mb-0 max-w-md text-left md:text-right"
                    >
                        <p className="font-sans text-[var(--text-muted)] text-sm md:text-base leading-relaxed transition-colors duration-500">
                            The AI astrologer that actually remembers.
                            <br />From your birth chart to last night's diary entry.
                            Warm, direct, and slightly unhinged.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="font-serif text-[4rem] md:text-[6.5rem] lg:text-[8rem] leading-[0.9] text-[var(--text-main)] text-right">
                            Ask her <br />
                            <Link href="/chat"
                                className="italic text-[var(--amber-200)] opacity-80 font-light cursor-pointer hover:border-b hover:border-[var(--amber-200)] transition-all"
                            >
                                anything.
                            </Link>
                        </h1>
                    </motion.div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-[var(--rose-300)] to-transparent"></div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">Scroll</span>
            </motion.div>
        </section>
    );
};
