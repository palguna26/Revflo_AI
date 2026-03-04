"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
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
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col h-[600px] lg:h-[calc(100vh-140px)] rounded-xl border border-neutral-800/40 bg-gradient-to-b from-neutral-900/30 to-neutral-900/10 backdrop-blur-md shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/60 bg-neutral-900/20">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 border border-purple-500/20 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    <h3 className="text-[13px] font-semibold text-neutral-200">Intelligence AI</h3>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 scrollbar-none">

                <div className="flex items-start gap-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700/60 shadow-sm mt-1">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 px-1">RevFlo AI</span>
                        <div className="rounded-xl rounded-tl-sm bg-neutral-800/40 border border-neutral-800/60 p-4 text-[13px] text-neutral-300 leading-relaxed shadow-sm hover:bg-neutral-800/50 transition-colors">
                            <p>
                                Based on current velocity and drift risk, your team is healthy but slowing down on the <strong className="text-white">Enterprise SSO</strong> initiative.
                            </p>
                            <div className="h-[1px] w-full bg-neutral-700/50 my-3" />
                            <p className="text-neutral-400">
                                How can I help you analyze this further?
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Input Area */}
            <div className="p-4 bg-neutral-900/40 border-t border-neutral-800/60 backdrop-blur-sm">
                <div className="mb-4 grid grid-cols-1 gap-2.5 flex-1 overflow-y-auto max-h-[140px] pr-1 py-1 scrollbar-none">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                        <PromptButton key={prompt} prompt={prompt} />
                    ))}
                </div>

                <div className="relative group/input mt-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-500/0 opacity-0 group-focus-within/input:opacity-100 rounded-xl blur-md transition-opacity duration-500 pointer-events-none" />
                    <textarea
                        rows={1}
                        placeholder="Ask AI for product intelligence..."
                        className="w-full resize-none rounded-xl border border-neutral-700/60 bg-neutral-950 px-4 py-3 placeholder:text-neutral-500 text-[13px] text-neutral-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 pr-12 hover:border-neutral-600 transition-all shadow-inner block scrollbar-none"
                    />
                    <button className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white hover:bg-neutral-200 text-black transition-colors shadow-sm">
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="mt-3 flex items-center justify-between px-1">
                    <p className="text-[10px] text-neutral-600 font-medium">
                        AI can make mistakes. Verify information.
                    </p>
                    <div className="text-[10px] font-mono text-neutral-600">
                        ⌘K
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
