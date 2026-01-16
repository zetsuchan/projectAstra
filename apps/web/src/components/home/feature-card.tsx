'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    colorVar: string;
    delay: number;
}

export const FeatureCard = ({ title, subtitle, icon: Icon, colorVar, delay }: FeatureCardProps) => {
    // Note: We need to handle dynamic styles carefully in Tailwind logic, 
    // but here we are using inline styles for dynamic variables which is fine.
    const colorStyle = { color: `var(--${colorVar})` };
    const bgStyle = { backgroundColor: `var(--${colorVar})` };
    const shadowStyle = { boxShadow: `0 0 10px var(--${colorVar})` };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
            className="group relative p-8 h-80 flex flex-col justify-between transition-colors duration-500 overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)]"
        >
            <div
                className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-700 pointer-events-none"
                style={bgStyle}
            />

            <div className="relative z-10">
                <div className="mb-4 opacity-80" style={colorStyle}>
                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-[var(--text-main)] mb-2 transition-colors duration-500">{title}</h3>
                <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed max-w-[250px] transition-colors duration-500">{subtitle}</p>
            </div>

            <div className="w-full h-[1px] bg-[var(--border-color)] group-hover:bg-white/30 transition-colors duration-500 relative">
                <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ ...bgStyle, ...shadowStyle }}
                />
            </div>
        </motion.div>
    );
};
