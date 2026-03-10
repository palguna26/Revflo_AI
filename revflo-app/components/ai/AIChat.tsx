"use client";

import { useState } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
    recommendation?: any;
}

const QUICK_PROMPTS = [
    "What should we build next?",
    "Where is our biggest risk?",
    "Write a spec for the top feature",
    "Break down the next sprint",
];

export function AIChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "I'm the Product Intelligence AI. Ask me anything about your product, signals, or roadmap.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const send = async (text: string) => {
        if (!text.trim() || loading) return;
        setInput("");

        const userMsg: Message = { role: "user", content: text };
        setMessages((m) => [...m, userMsg]);
        setLoading(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to fetch response");
            }

            const data = await res.json();

            setMessages((m) => [...m, {
                role: "assistant",
                content: data.reply || "I couldn't generate a response based on the current data.",
                recommendation: data.recommendation
            }]);
        } catch (error: any) {
            setMessages((m) => [...m, {
                role: "assistant",
                content: `Error: ${error.message}. Please make sure you have connected integrations to pull actual product signals.`
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-sm font-medium">Product Intelligence AI</span>
                <span className="ml-auto text-xs text-neutral-500">Powered by Groq · llama-3.3-70b</span>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-5 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] ${msg.role === "user" ? "bg-indigo-600/20 border-indigo-500/20" : "bg-white/4 border-white/8"} border rounded-xl px-4 py-3`}>
                            <p className="text-sm text-neutral-200 whitespace-pre-line leading-relaxed">
                                {msg.content.replace(/\*\*(.*?)\*\*/g, (_, t) => t)
                                    .split(/\*\*(.*?)\*\*/)
                                    .map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part)}
                            </p>

                            {/* Feature recommendation card */}
                            {msg.recommendation && (
                                <div className="mt-4 border border-indigo-500/20 rounded-xl bg-indigo-500/8 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-white">{msg.recommendation.feature}</p>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{msg.recommendation.confidence}% confidence</span>
                                    </div>
                                    <p className="text-xs text-neutral-400 leading-relaxed">{msg.recommendation.reason}</p>
                                    <p className="text-xs text-emerald-400">{msg.recommendation.expected_impact}</p>
                                    <div className="space-y-1.5 pt-1">
                                        {msg.recommendation.tasks?.map((t: any) => (
                                            <div key={t.id} className="flex items-center gap-2 text-xs text-neutral-400">
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${t.type === 'backend' ? 'bg-blue-500/20 text-blue-400' :
                                                    t.type === 'frontend' ? 'bg-purple-500/20 text-purple-400' :
                                                        t.type === 'ai' ? 'bg-indigo-500/20 text-indigo-400' :
                                                            'bg-neutral-500/20 text-neutral-400'
                                                    }`}>{t.type}</span>
                                                <span>{t.title}</span>
                                                <span className="ml-auto text-neutral-600">{t.estimate}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                        Analyzing signals…
                    </div>
                )}
            </div>

            {/* Quick prompts */}
            <div className="px-5 pb-3 flex gap-2 flex-wrap border-t border-white/5 pt-3">
                {QUICK_PROMPTS.map(p => (
                    <button
                        key={p}
                        onClick={() => send(p)}
                        className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-neutral-400 hover:text-white hover:border-indigo-500/40 transition-colors"
                    >
                        {p}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="px-4 pb-4 flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send(input)}
                    placeholder="Ask about your product…"
                    className="flex-1 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || loading}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-sm font-medium transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
