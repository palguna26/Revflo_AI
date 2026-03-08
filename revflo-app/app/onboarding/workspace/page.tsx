'use client'

import { useState } from 'react'
import { createWorkspace } from './actions'

export default function WorkspaceOnboardingPage() {
    const [name, setName] = useState('')

    // Auto-generate slug by lowercasing and replacing spaces with hyphens, stripping non-alphanumeric chars
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[400px]">
                {/* Step Indicator */}
                <div className="mb-6 flex flex-col gap-2">
                    <div className="flex bg-[#222222] h-1 rounded-full overflow-hidden">
                        <div className="w-1/2 bg-indigo-500 rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest text-center">Step 1 of 2: Create Workspace</p>
                </div>

                {/* Main Card */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                    <div className="mb-6">
                        <h1 className="text-xl text-white font-semibold tracking-tight">Name your workspace</h1>
                        <p className="text-sm text-neutral-400 mt-1">This will be the home for all your project signals.</p>
                    </div>

                    <form action={createWorkspace} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-300 ml-1" htmlFor="name">Workspace Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="eg. RevFlo"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                        </div>

                        {/* Hidden input to pass slug to the server action */}
                        <input type="hidden" name="slug" value={slug} />

                        {slug && (
                            <div className="px-1 pt-1 pb-3 text-sm text-neutral-400">
                                Your unique workspace link will be:<br />
                                <span className="text-indigo-400 font-medium mt-1 inline-block">revflo.site/{slug}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className={`w-full text-center rounded-xl py-3 text-sm font-semibold transition-colors ${name.trim()
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                                    : 'bg-white/5 text-neutral-500 cursor-not-allowed'
                                }`}
                        >
                            Create Workspace
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
