export function PromptButton({ prompt, onClick }: { prompt: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group inline-flex w-full items-center justify-between rounded-lg border border-neutral-800/40 bg-neutral-900/30 px-3.5 py-2.5 text-[13px] font-medium text-neutral-400 shadow-sm hover:border-neutral-700 hover:bg-neutral-800/50 hover:text-neutral-200 hover:shadow-md transition-all duration-200"
        >
            <span className="truncate pr-3">{prompt}</span>
            <div className="flex items-center justify-center p-0.5 rounded-md bg-transparent group-hover:bg-neutral-700/50 transition-colors">
                <svg
                    className="h-3 w-3 shrink-0 text-neutral-500 opacity-40 group-hover:opacity-100 transition-opacity"
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
