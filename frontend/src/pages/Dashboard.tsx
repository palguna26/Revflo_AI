import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getMe, runAnalysis, connectGitHub } from '../lib/api'
import type { Repository } from '../types'

function SkeletonCard() {
    return (
        <div className="glass-card" style={{ padding: 24 }}>
            <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 12, width: '40%' }} />
        </div>
    )
}

interface RepoCardProps { repo: Repository; orgId: string }
function RepoCard({ repo, orgId }: RepoCardProps) {
    const navigate = useNavigate()
    const qc = useQueryClient()
    const [analysisLoading, setAnalysisLoading] = useState(false)

    const handleRunAnalysis = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setAnalysisLoading(true)
        try {
            const { report_id } = await runAnalysis(orgId, repo.id)
            qc.invalidateQueries({ queryKey: ['repositories'] })
            navigate(`/report/${report_id}`)
        } catch (err) {
            alert('Analysis failed. Check repo permissions and try again.')
        } finally {
            setAnalysisLoading(false)
        }
    }

    return (
        <div
            className="glass-card"
            onClick={() => navigate(`/repo/${repo.id}`)}
            style={{ padding: 22, cursor: 'pointer', transition: 'all 0.2s' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#e4e4f0' }}>{repo.name}</span>
                        {repo.private && (
                            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#1e1e2e', color: '#6b7280' }}>PRIVATE</span>
                        )}
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>{repo.full_name}</p>
                </div>
                <button
                    onClick={handleRunAnalysis}
                    disabled={analysisLoading}
                    style={{
                        padding: '8px 16px', background: '#6366f1', color: '#fff',
                        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', opacity: analysisLoading ? 0.7 : 1,
                    }}
                >
                    {analysisLoading ? 'Running…' : '▶ Analyze'}
                </button>
            </div>
        </div>
    )
}

export function DashboardPage() {
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        retry: 1,
    })

    const { data: repos = [], isLoading: reposLoading } = useQuery({
        queryKey: ['repositories'],
        queryFn: async () => {
            const { data } = await supabase.from('repositories').select('*')
            return (data ?? []) as Repository[]
        },
        enabled: !!profile?.organization?.id,
        staleTime: 5 * 60 * 1000,
    })

    const handleConnect = () => {
        if (!profile?.organization?.id) return alert('Please wait while loading your profile…')
        connectGitHub(profile.organization.id)
    }

    const handleLogout = () => supabase.auth.signOut()

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Nav */}
            <nav style={{
                borderBottom: '1px solid #1e1e2e', padding: '16px 32px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span className="gradient-text" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>RevFlo</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: '#6b7280', fontSize: 13 }}>{profile?.email}</span>
                    <button onClick={handleLogout} style={ghostBtn}>Sign out</button>
                </div>
            </nav>

            <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
                        {profileLoading ? (
                            <span className="skeleton" style={{ display: 'inline-block', width: 200, height: 28 }} />
                        ) : (
                            profile?.organization?.name || 'My Dashboard'
                        )}
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: 15 }}>Analyze your GitHub repositories for execution health.</p>
                </div>

                {/* Connect GitHub button */}
                <div style={{ marginBottom: 36 }}>
                    <button onClick={handleConnect} style={githubBtn}>
                        <GitHubIcon />
                        Connect GitHub
                    </button>
                </div>

                {/* Repositories */}
                <div>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
                        Repositories
                    </h2>

                    {reposLoading || profileLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <SkeletonCard /><SkeletonCard /><SkeletonCard />
                        </div>
                    ) : repos.length === 0 ? (
                        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🔌</div>
                            <p style={{ fontSize: 16, fontWeight: 600, color: '#9ca3af', marginBottom: 6 }}>No repositories connected</p>
                            <p style={{ fontSize: 14, color: '#4b5563' }}>Click "Connect GitHub" above to link your repositories.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {repos.map((repo) => (
                                <RepoCard key={repo.id} repo={repo} orgId={profile?.organization?.id || ''} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function GitHubIcon() {
    return (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
    )
}

const ghostBtn: React.CSSProperties = {
    padding: '8px 14px', background: 'transparent', color: '#9ca3af',
    border: '1px solid #1e1e2e', borderRadius: 8, fontSize: 13,
    cursor: 'pointer',
}
const githubBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center',
    padding: '12px 22px', background: '#18181b', color: '#e4e4f0',
    border: '1px solid #2a2a3e', borderRadius: 10, fontSize: 14,
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
}
