"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()
    const [retrying, setRetrying] = useState(false)

    const isWorkspaceSetup = error.message.includes('Setting up your workspace')

    useEffect(() => {
        if (isWorkspaceSetup) {
            setRetrying(true)
            const timer = setTimeout(() => {
                reset() // This attempts to re-render the segment
                router.refresh() // This forces a full server data refresh
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [isWorkspaceSetup, reset, router])

    if (isWorkspaceSetup) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0A] text-white p-4">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold">Creating your workspace...</h2>
                    <p className="text-sm text-neutral-400">
                        This usually takes just a few seconds. We're setting everything up for you.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white space-y-4">
            <h2 className="text-xl font-semibold text-red-400">Something went wrong</h2>
            <p className="text-sm text-neutral-400 max-w-md">
                {error.message || "An unexpected error occurred loading your dashboard."}
            </p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-sm font-medium"
            >
                Try again
            </button>
        </div>
    )
}
