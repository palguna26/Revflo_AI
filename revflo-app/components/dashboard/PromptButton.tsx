export function PromptButton({ prompt, onClick }: { prompt: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="inline-flex w-full items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
        >
            <span className="truncate pr-2">&quot;{prompt}&quot;</span>
            <svg
                className="h-3 w-3 shrink-0 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
}
