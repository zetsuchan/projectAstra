'use client';
import { motion } from 'framer-motion';

export const OrbitVisual = ({ theme }: { theme?: string }) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-60">
            <div className="absolute w-[800px] h-[800px] bg-glow-radial rounded-full blur-3xl opacity-20" />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute w-[600px] h-[600px] rounded-full"
                style={{ border: '1px solid var(--orbit-color)' }}
            />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute w-[600px] h-[600px] rounded-full"
            >
                <div className="w-2 h-2 bg-[var(--rose-300)] rounded-full absolute -top-1 left-1/2 shadow-[0_0_10px_rgba(253,164,175,0.8)]" />
            </motion.div>
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                className="absolute w-[450px] h-[450px] rounded-full opacity-60"
                style={{ border: '1px dashed var(--orbit-color)' }}
            />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute w-[280px] h-[280px] rounded-full"
                style={{ border: '1px solid var(--orbit-color)' }}
            />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute w-[280px] h-[280px] rounded-full"
            >
                <div className="w-3 h-3 bg-[var(--lilac-300)] rounded-full absolute top-1/2 -right-1.5 shadow-[0_0_15px_rgba(216,180,254,0.8)]" />
            </motion.div>
        </div>
    );
};
