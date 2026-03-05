export default function RoadmapPage() {
    return (
        <div className="p-8 space-y-8">
            <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Execution Audit</p>
                <h1 className="text-2xl font-bold">Roadmap vs Reality</h1>
            </div>

            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-neutral-800 rounded-2xl bg-[#111111]/50 mb-8">
                <div className="w-12 h-12 rounded-full border border-neutral-700 bg-neutral-800/50 flex items-center justify-center mb-4 text-xl text-neutral-500">
                    ◬
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Roadmap Data Yet</h3>
                <p className="text-sm text-neutral-400 text-center max-w-md mb-6 leading-relaxed">
                    Connect your Jira or Linear integrations to automatically sync roadmap themes and compare them against actual engineering execution.
                </p>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
                    Configure Integrations
                </button>
            </div>
        </div>
    );
}
