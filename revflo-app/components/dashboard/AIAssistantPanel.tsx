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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col h-[600px] rounded-xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm"
        >
            <div className="flex items-center gap-2 p-4 border-b border-neutral-800/80">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="text-sm font-semibold text-neutral-100">Product Intelligence AI</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-xs font-semibold text-neutral-400">RevFlo AI</span>
                        <div className="rounded-2xl rounded-tl-none bg-neutral-800/50 px-4 py-3 text-sm text-neutral-300">
                            <p>
                                Based on current velocity and drift risk, your team is healthy but slowing down on the <strong>Enterprise SSO</strong> initiative.
                            </p>
                            <br />
                            <p>
                                How can I help you analyze this further?
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-neutral-900/50 border-t border-neutral-800/80">
                <div className="mb-4 grid grid-cols-1 gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                        <div key={prompt} className="group">
                            <PromptButton prompt={prompt} />
                        </div>
                    ))}
                </div>

                <div className="relative group/input">
                    <textarea
                        placeholder="Ask AI for product intelligence..."
                        className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 placeholder-neutral-500 text-sm text-neutral-100 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 py-3 pr-10 hover:border-neutral-600 transition-colors shadow-inner block scrollbar-none h-[52px]"
                    />
                    <button className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500 hover:bg-purple-400 text-white transition-colors">
                        <Send className="h-4 w-4" />
                    </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-neutral-600 font-medium">
                    AI can make mistakes. Consider verifying important information.
                </p>
            </div>
        </motion.div>
    );
}
