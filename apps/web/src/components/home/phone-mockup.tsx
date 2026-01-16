'use client';
import { Sparkles, Send, TrendingUp } from 'lucide-react';

export const PhoneMockup = () => {
    return (
        <div
            className="relative w-full max-w-sm mx-auto aspect-[9/19] rounded-[3rem] shadow-2xl overflow-hidden p-4 border transition-colors duration-500 bg-[var(--cosmic-950)] border-[#292524]"
        >
            <div className="w-full flex justify-between px-4 py-2 text-[10px] text-stone-500 font-sans mb-4">
                <span>9:41</span>
                <div className="w-16 h-4 bg-black rounded-full absolute top-4 left-1/2 -translate-x-1/2"></div>
                <div className="flex gap-1">
                    <div className="w-3 h-3 border border-stone-600 rounded-sm"></div>
                </div>
            </div>

            <div className="mb-6 px-2 flex justify-between items-center">
                <div className="font-serif text-lg text-[var(--rose-100)]">Chat with Astra</div>
                <div className="w-8 h-8 rounded-full bg-[var(--rose-900)]/30 flex items-center justify-center">
                    <Sparkles size={14} className="text-[var(--rose-300)]" />
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--rose-400)] to-[var(--lilac-300)] flex-shrink-0" />
                    <div className="p-3 bg-white/5 rounded-2xl rounded-tl-none border border-white/5 max-w-[85%]">
                        <p className="font-sans text-xs text-stone-300 leading-relaxed">
                            Looking at your transit chart, Mars is squaring your natal Venus.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <div className="p-3 bg-[var(--rose-900)]/20 rounded-2xl rounded-tr-none border border-[var(--rose-400)]/20 max-w-[85%]">
                        <p className="font-sans text-xs text-[var(--rose-100)] leading-relaxed">
                            Does that mean I shouldn't text him?
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--rose-400)] to-[var(--lilac-300)] flex-shrink-0" />
                    <div className="p-3 bg-white/5 rounded-2xl rounded-tl-none border border-white/5 max-w-[85%]">
                        <p className="font-sans text-xs text-stone-300 leading-relaxed">
                            <span className="text-[var(--rose-300)] font-medium">Memory Recall:</span> Last Tuesday you wrote in your diary that he was an "emotional vampire." <br /><br />
                            So, yes. Do not text him.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-3 bg-gradient-to-br from-[var(--amber-200)]/10 to-transparent rounded-xl border border-[var(--amber-200)]/20 mt-4">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--amber-200)] font-medium">Prediction Market</span>
                    <TrendingUp size={12} className="text-[var(--amber-200)]" />
                </div>
                <p className="font-serif text-sm text-stone-200 mb-2">Will Taylor & Travis breakup before her Saturn Return?</p>
                <div className="flex gap-2 text-[10px]">
                    <div className="flex-1 bg-white/10 py-1.5 rounded text-center text-white hover:bg-white/20">YES 42%</div>
                    <div className="flex-1 bg-[var(--rose-900)]/40 py-1.5 rounded text-center text-[var(--rose-200)] border border-[var(--rose-500)]/30">NO 58%</div>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 h-12 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center px-4 justify-between">
                <span className="text-xs text-stone-600">Type a message...</span>
                <div className="w-8 h-8 rounded-full bg-[var(--text-main)] flex items-center justify-center">
                    <Send size={12} className="text-[var(--bg-main)] ml-0.5" />
                </div>
            </div>
        </div>
    )
}
