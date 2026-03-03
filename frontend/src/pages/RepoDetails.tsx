import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, runAnalysis } from '../lib/api'
import { supabase } from '../lib/supabase'
import { RoadmapInput } from '../components/score/RoadmapInput'
import type { Repository } from '../types'

function SkeletonBlock({ h = 16, w = '100%' }: { h?: number; w?: string }) {
    return <div className="skeleton" style={{ height: h, width: w }} />
}

export function RepoDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const qc = useQueryClient()
    const [analysisError, setAnalysisError] = useState<string | null>(null)

    const { data: profile } = useQuery({ queryKey: ['me'], queryFn: getMe, retry: 1 })

    const { data: repo, isLoading: repoLoading } = useQuery({
        queryKey: ['repo', id],
        queryFn: async () => {
            const { data } = await supabase.from('repositories').select('*').eq('id', id!).single()
            return data as Repository
        },
        enabled: !!id,
    })

    const analysisMutation = useMutation({
        mutationFn: () => runAnalysis(profile!.organization!.id, id!),
        onSuccess: ({ report_id }) => {
            qc.invalidateQueries({ queryKey: ['repo', id] })
            window.location.href = `/report/${report_id}`
        },
        onError: () => setAnalysisError('⚠ Analysis Failed\nTry again or check repo permissions.'),
    })

    const orgId = profile?.organization?.id || ''

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Nav */}
            <nav style={{ borderBottom: '1px solid #1e1e2e', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link to="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13 }}>← Dashboard</Link>
                <span style={{ color: '#2a2a3e' }}>/</span>
                {repoLoading ? <SkeletonBlock h={14} w="120px" /> : (
                    <span style={{ color: '#e4e4f0', fontSize: 14, fontWeight: 600 }}>{repo?.name}</span>
                )}
            </nav>

            <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
                            {repoLoading ? <SkeletonBlock h={26} w="200px" /> : repo?.full_name}
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: 14 }}>Repository execution audit</p>
                    </div>
                    <button
                        onClick={() => analysisMutation.mutate()}
                        disabled={analysisMutation.isPending || !profile?.organization}
                        style={{
                            padding: '12px 24px', background: '#6366f1', color: '#fff',
                            border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                            cursor: 'pointer', opacity: analysisMutation.isPending ? 0.7 : 1,
                        }}
                    >
                        {analysisMutation.isPending ? '⏳ Running Analysis…' : '▶ Run Analysis'}
                    </button>
                </div>

                {analysisError && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
                        <p style={{ color: '#f87171', fontWeight: 600, marginBottom: 4 }}>⚠ Analysis Failed</p>
                        <p style={{ color: '#9ca3af', fontSize: 13 }}>Try again or check repo permissions.</p>
                    </div>
                )}

                {/* Roadmap Input */}
                {id && orgId && (
                    <div style={{ marginBottom: 24 }}>
                        <RoadmapInput organizationId={orgId} repositoryId={id} />
                    </div>
                )}

                {/* Info message */}
                <div className="glass-card fade-in" style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>
                    <p style={{ fontSize: 16, marginBottom: 6 }}>📊</p>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#9ca3af' }}>No analysis yet</p>
                    <p style={{ fontSize: 13, marginTop: 6 }}>Save your roadmap above and click <strong style={{ color: '#818cf8' }}>Run Analysis</strong> to see execution metrics.</p>
                </div>
            </main>
        </div>
    )
}
