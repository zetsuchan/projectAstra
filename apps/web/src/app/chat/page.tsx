'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles, Sun, Moon, Zap, BookOpen, Clock, Send } from 'lucide-react';
import Link from 'next/link';
import { OrbitVisual } from '@/components/ui/orbit-visual';
import type { ChatMessage } from '@/lib/api-types';
import { DEFAULT_THREAD_ID, fetchChatMessages, sendChatMessage } from '@/lib/api-client';

interface ChatPageProps {
    theme?: string;
    toggleTheme?: () => void;
}

export default function ChatPage() {
    // Local theme state for now, ideally this moves to a Context
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
        document.documentElement.classList.toggle('light');
    };

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;

        const loadMessages = async () => {
            const data = await fetchChatMessages(DEFAULT_THREAD_ID);
            if (isMounted) {
                setMessages(data);
                setIsLoading(false);
            }
        };

        loadMessages();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSend = async () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        const newMsg: ChatMessage = {
            id: crypto.randomUUID(),
            threadId: DEFAULT_THREAD_ID,
            role: 'user',
            content: trimmed,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, newMsg]);
        setInputValue("");

        const response = await sendChatMessage(DEFAULT_THREAD_ID, trimmed);

        if (response?.assistantMessage) {
            setMessages(prev => [...prev, response.assistantMessage]);
        } else {
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                threadId: DEFAULT_THREAD_ID,
                role: 'assistant',
                content: 'AI response unavailable. Check your OpenRouter configuration.',
                createdAt: new Date().toISOString(),
            }]);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`relative h-screen flex flex-col overflow-hidden ${theme}`}
        >
            <OrbitVisual theme={theme} />

            {/* Chat Header */}
            <header className="relative z-20 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-main)]/80 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--rose-400)] to-[var(--lilac-300)] flex items-center justify-center shadow-lg shadow-[var(--rose-400)]/20">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-serif text-lg leading-none text-[var(--text-main)]">Astra</h2>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Online & Judging</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-[var(--bg-card-hover)] transition-colors text-[var(--text-main)]"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="flex-1 relative z-10 flex overflow-hidden">

                {/* Desktop Sidebar (Context) */}
                <div className="hidden lg:flex w-80 border-r border-[var(--border-color)] flex-col bg-[var(--glass-panel)] backdrop-blur-sm p-6 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">Active Context</h3>

                        {/* Context Card 1 */}
                        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                            <div className="flex items-center gap-2 mb-2 text-[var(--rose-300)]">
                                <Zap size={14} />
                                <span className="text-xs font-medium uppercase">Current Transit</span>
                            </div>
                            <p className="font-serif text-[var(--text-main)] text-sm">Mars square Venus</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Tension in romantic communications. High impulsivity.</p>
                        </div>

                        {/* Context Card 2 */}
                        <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                            <div className="flex items-center gap-2 mb-2 text-[var(--lilac-300)]">
                                <BookOpen size={14} />
                                <span className="text-xs font-medium uppercase">Memory Recall</span>
                            </div>
                            <p className="font-serif text-[var(--text-main)] text-sm">Oct 24th Diary</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">"He makes me feel small when I talk about my art."</p>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="h-[1px] w-full bg-[var(--border-color)] mb-4" />
                        <div className="flex justify-between items-center text-[var(--text-muted)] text-xs">
                            <span>Prediction Market</span>
                            <span className="text-[var(--amber-200)]">Live</span>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col relative bg-gradient-to-b from-transparent to-[var(--bg-main)]/50">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                        {!isLoading && messages.length === 0 && (
                            <div className="text-sm text-[var(--text-muted)] text-center">
                                No messages yet. Start the conversation.
                            </div>
                        )}
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--rose-400)] to-[var(--lilac-300)] flex-shrink-0 flex items-center justify-center mt-1">
                                        <Sparkles size={12} className="text-white" />
                                    </div>
                                )}

                                <div className={`max-w-[85%] md:max-w-[70%] space-y-1 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                                    {msg.context && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--rose-300)] uppercase tracking-wide mb-1">
                                            <Clock size={10} />
                                            {msg.context}
                                        </div>
                                    )}
                                    <div
                                        className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm
                                            ${msg.role === 'user'
                                                ? 'bg-[var(--rose-900)]/20 border border-[var(--rose-400)]/20 text-[var(--text-main)] rounded-tr-sm'
                                                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] rounded-tl-sm backdrop-blur-md'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-6 pb-24 md:pb-8 z-20">
                        <div className="max-w-4xl mx-auto relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--rose-400)] to-[var(--lilac-300)] rounded-full opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                            <div className="relative flex items-center bg-[var(--bg-main)] rounded-full border border-[var(--border-color)] shadow-xl">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask Astra anything..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none"
                                />
                                <button
                                    onClick={handleSend}
                                    className="mr-2 p-3 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] hover:scale-105 transition-transform"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-[var(--text-muted)] mt-3 opacity-50">
                            Astra knows your chart, but she isn't a licensed therapist.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
