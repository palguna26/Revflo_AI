"use client";

import { useState } from "react";
import { DEMO_FEATURE_RECOMMENDATION } from "@/data/demo-data";

interface Message {
    role: "user" | "assistant";
    content: string;
    recommendation?: typeof DEMO_FEATURE_RECOMMENDATION;
}

const QUICK_PROMPTS = [
    "What should we build next?",
    "Where is our biggest risk?",
    "Write a spec for the top feature",
    "Break down the next sprint",
];

const DEMO_RESPONSES: Record<string, { text: string; showRec?: boolean }> = {
    "What should we build next?": {
        text: "Based on your product signals, I've analyzed 20 PRs, 15 Linear issues, and 10 Stripe events. Here's my recommendation:",
        showRec: true,
    },
    "Where is our biggest risk?": {
        text: "Your biggest risk is **scope drift**. 2 large PRs (612 + 532 LOC) are building real-time collaboration features that aren't on your Q1 roadmap. This represents ~1,100 lines of unplanned engineering work.\n\nAdditionally, your Q1 priority 'Mobile experience' has 45% roadmap alignment with no active PRs — it's being systematically de-prioritized without explicit acknowledgment.",
    },
    "Write a spec for the top feature": {
        text: "Here's a product spec based on your highest-signal opportunity:",
        showRec: true,
    },
    "Break down the next sprint": {
        text: "Based on your Linear issues and open PRs, here's a recommended 2-week sprint:\n\n**Week 1 — Onboarding (Impact: High)**\n• Role detection on signup (2d)\n• Adaptive onboarding flow (3d)\n\n**Week 2 — Enterprise (Revenue: High)**\n• Jira epic mapping to roadmap (2d)\n• Team workspace sharing (3d)\n\nThis sprint targets your top growth lever (activation) and top revenue opportunity (enterprise expansion). Estimated output: +40% trial conversion, 2 enterprise accounts closer to expand.",
    },
};

export function AIChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "I've analyzed your product signals. Your execution score is **74/100**. Top finding: onboarding drop-off is your highest ROI fix. Ask me anything about your product.",
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

        // Simulate network latency
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

        let response: Message;
        const matched = DEMO_RESPONSES[text];
        if (matched) {
            response = {
                role: "assistant",
                content: matched.text,
                recommendation: matched.showRec ? DEMO_FEATURE_RECOMMENDATION : undefined,
            };
        } else {
            // Fallback: try real Groq API if key exists, else generic
            try {
                const res = await fetch("/api/ai/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: text, context: "demo" }),
                });
                if (res.ok) {
                    const data = await res.json();
                    response = { role: "assistant", content: data.reply };
                } else {
                    throw new Error("no api");
                }
            } catch {
                response = {
                    role: "assistant",
                    content: `Great question. Based on your signals:\n\n• **Execution score**: 74/100 (↑5 this week)\n• **Top risk**: Scope drift in collaboration features\n• **Top opportunity**: Onboarding completion (34% → target 70%)\n\nWant me to generate a feature spec or sprint breakdown?`,
                };
            }
        }

        setMessages((m) => [...m, response]);
        setLoading(false);
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
                                        {msg.recommendation.tasks.map(t => (
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
