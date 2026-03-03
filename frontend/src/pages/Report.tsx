import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useReport } from '../hooks/useReports'
import { ExecutionScoreCard } from '../components/score/ExecutionScoreCard'
import { RiskList } from '../components/risks/RiskList'
import { DriftPanel } from '../components/charts/DriftPanel'

function Skeleton() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '40px 24px', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {[280, 180, 220, 160].map((h, i) => (
                    <div key={i} className="skeleton" style={{ height: h, borderRadius: 12 }} />
                ))}
            </div>
        </div>
    )
}

function ShareCard({ score, breakdown }: { score: number; breakdown: Record<string, number> }) {
    const handleShare = () => {
        const text = `My team's Execution Health Score: ${Math.round(score)}/100\n\n` +
            `📈 Velocity: ${breakdown.velocity?.toFixed(0)}\n` +
            `🎯 Scope: ${breakdown.scope?.toFixed(0)}\n` +
            `⏱ Review: ${breakdown.review?.toFixed(0)}\n` +
            `🔀 Fragmentation: ${breakdown.fragmentation?.toFixed(0)}\n` +
            `🧭 Drift: ${breakdown.drift?.toFixed(0)}\n\n` +
            `Powered by RevFlo – execution clarity for founders.`
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    return (
        <div className="glass-card fade-in" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                Share Result
            </h2>
            <div style={{ background: '#0d0d16', borderRadius: 10, padding: '16px 20px', marginBottom: 16, fontFamily: 'monospace', fontSize: 13, color: '#9ca3af', lineHeight: 1.8 }}>
                <p style={{ color: '#e4e4f0', fontWeight: 700, marginBottom: 6 }}>Execution Score: {Math.round(score)}/100</p>
                <p>Velocity: {(breakdown.velocity || 0).toFixed(0)}</p>
                <p>Scope Control: {(breakdown.scope || 0).toFixed(0)}</p>
                <p>Review Efficiency: {(breakdown.review || 0).toFixed(0)}</p>
                <p>Drift Risk: {(breakdown.drift || 0).toFixed(0)}</p>
            </div>
            <button
                onClick={handleShare}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', background: '#0a66c2', color: '#fff',
                    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                }}
            >
                <LinkedInIcon /> Share on LinkedIn
            </button>
        </div>
    )
}

function LinkedInIcon() {
    return (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    )
}

export function ReportPage() {
    const { id } = useParams<{ id: string }>()
    const { data: report, isLoading, error } = useReport(id)

    if (isLoading) return <Skeleton />

    if (error || !report) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}>⚠</p>
                    <p style={{ fontSize: 18, fontWeight: 600, color: '#f87171' }}>Report not found</p>
                    <Link to="/dashboard" style={{ color: '#818cf8', fontSize: 14, marginTop: 12, display: 'block' }}>← Back to Dashboard</Link>
                </div>
            </div>
        )
    }

    const createdAt = new Date(report.created_at).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            {/* Nav */}
            <nav style={{ borderBottom: '1px solid #1e1e2e', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13 }}>← Dashboard</Link>
                <span style={{ color: '#4b5563', fontSize: 13 }}>{createdAt}</span>
            </nav>

            <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
                <div style={{ marginBottom: 36 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
                        Execution Report
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: 14 }}>Full audit for this analysis run</p>
                </div>

                {/* 2-column layout: score + risks */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <ExecutionScoreCard score={report.score} breakdown={report.breakdown} />
                    <RiskList risks={report.risks} />
                </div>

                {/* AI Summary */}
                <div className="glass-card fade-in" style={{ padding: 28, marginBottom: 20 }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                        AI Founder Brief {report.summary_status === 'failed' && <span style={{ color: '#f87171', marginLeft: 8 }}>(unavailable)</span>}
                    </h2>
                    <p style={{ fontSize: 15, color: '#c4c4d4', lineHeight: 1.8, fontStyle: report.summary_status === 'failed' ? 'italic' : 'normal' }}>
                        {report.summary}
                    </p>
                </div>

                {/* Drift panel */}
                <div style={{ marginBottom: 20 }}>
                    <DriftPanel
                        misalignedPrs={report.misaligned_prs}
                        newClusters={report.new_clusters}
                        driftScore={report.breakdown.drift}
                    />
                </div>

                {/* Share */}
                <ShareCard score={report.score} breakdown={report.breakdown as unknown as Record<string, number>} />
            </main>
        </div>
    )
}
