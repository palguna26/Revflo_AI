"use client";

import { motion } from "framer-motion";
import { Sparkles, Send } from "lucide-react";
import { PromptButton } from "./PromptButton";

const SUGGESTED_PROMPTS = [
    "What should we build next?",
    "Where is our biggest risk?",
    "Write a spec for the top feature",
    "Break down the next sprint",
];

export function AIAssistantPanel() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col h-[calc(100vh-64px)] rounded-xl border border-neutral-800/40 bg-[#111111] overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0C0C0C]">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-blue-500/10 border border-blue-500/20">
                        <Sparkles className="h-3 w-3 text-blue-400" />
                    </div>
                    <h3 className="text-[12px] font-semibold text-neutral-300 tracking-wide">Intelligence AI</h3>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 scrollbar-none bg-[#0e0e0e]">

                <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-[#1A1A1A] border border-white/5 mt-0.5">
                        <Sparkles className="h-3 w-3 text-blue-400" />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">RevFlo</span>
                        <div className="text-[13px] text-neutral-300 leading-relaxed max-w-[90%]">
                            <p>
                                I am the Intelligence AI. I'll automatically analyze your integrations and uploaded feedback to detect drift, measure velocity, and suggest what to build next.
                            </p>
                            <br />
                            <p className="text-neutral-400">
                                Connect an integration to get started, or ask me a specific question.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#0C0C0C] border-t border-white/5">
                <div className="mb-4 grid grid-cols-1 gap-2 flex-1 overflow-y-auto max-h-[140px] scrollbar-none">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                        <PromptButton key={prompt} prompt={prompt} />
                    ))}
                </div>

                <div className="relative group/input mt-3 flex items-center border border-white/10 bg-[#141414] rounded-lg focus-within:border-blue-500/50 transition-colors shadow-sm">
                    <textarea
                        rows={1}
                        placeholder="Ask AI for product intelligence..."
                        className="w-full resize-none bg-transparent px-3 py-2.5 placeholder:text-neutral-600 text-[12px] text-neutral-200 focus:outline-none focus:ring-0 block scrollbar-none min-h-[40px] max-h-[120px]"
                    />
                    <button className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-[#2A2A2A] hover:bg-white text-neutral-400 hover:text-black transition-colors mr-2">
                        <Send className="h-3 w-3" />
                    </button>
                </div>

                <div className="mt-3 flex items-center justify-between px-1">
                    <p className="text-[10px] text-neutral-600">
                        AI can make mistakes. Verify information.
                    </p>
                    <div className="flex items-center gap-1">
                        <kbd className="text-[9px] font-sans font-medium text-neutral-600 bg-[#1A1A1A] px-1.5 py-0.5 rounded border border-white/5">⌘</kbd>
                        <kbd className="text-[9px] font-sans font-medium text-neutral-600 bg-[#1A1A1A] px-1.5 py-0.5 rounded border border-white/5">K</kbd>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
