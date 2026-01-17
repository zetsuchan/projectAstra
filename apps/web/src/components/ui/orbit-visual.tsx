'use client';

// CSS animations are more performant than Framer Motion for infinite rotations
// They run on the compositor thread and don't trigger JS on every frame

export const OrbitVisual = ({ theme }: { theme?: string }) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-60">
            {/* Reduced blur on mobile for performance */}
            <div className="absolute w-[800px] h-[800px] bg-glow-radial rounded-full blur-xl md:blur-3xl opacity-20" />

            {/* Outer orbit - 120s rotation */}
            <div
                className="absolute w-[600px] h-[600px] rounded-full animate-orbit-slow will-change-transform"
                style={{ border: '1px solid var(--orbit-color)' }}
            />
            <div className="absolute w-[600px] h-[600px] rounded-full animate-orbit-slow will-change-transform">
                <div className="w-2 h-2 bg-[var(--rose-300)] rounded-full absolute -top-1 left-1/2 shadow-[0_0_10px_rgba(253,164,175,0.8)]" />
            </div>

            {/* Middle orbit - 90s counter-rotation */}
            <div
                className="absolute w-[450px] h-[450px] rounded-full opacity-60 animate-orbit-medium-reverse will-change-transform"
                style={{ border: '1px dashed var(--orbit-color)' }}
            />

            {/* Inner orbit - 40s rotation */}
            <div
                className="absolute w-[280px] h-[280px] rounded-full animate-orbit-fast will-change-transform"
                style={{ border: '1px solid var(--orbit-color)' }}
            />
            <div className="absolute w-[280px] h-[280px] rounded-full animate-orbit-fast will-change-transform">
                <div className="w-3 h-3 bg-[var(--lilac-300)] rounded-full absolute top-1/2 -right-1.5 shadow-[0_0_15px_rgba(216,180,254,0.8)]" />
            </div>
        </div>
    );
};
