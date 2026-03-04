export function PromptButton({ prompt, onClick }: { prompt: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group inline-flex w-full items-center justify-between rounded-lg border border-white/5 bg-[#141414] px-3.5 py-2 text-[12px] font-medium text-neutral-400 hover:border-white/10 hover:bg-[#1A1A1A] hover:text-neutral-200 transition-all duration-200"
        >
            <span className="truncate pr-3">{prompt}</span>
            <div className="flex items-center justify-center p-0.5 rounded-sm bg-transparent group-hover:bg-[#2A2A2A] transition-colors">
                <svg
                    className="h-2.5 w-2.5 shrink-0 text-neutral-500 opacity-40 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    );
}
