import type { MisalignedPR } from '../../types'

interface Props {
    misalignedPrs: MisalignedPR[]
    newClusters: string[]
    driftScore: number
}

function getSimilarityColor(sim: number): string {
    if (sim >= 0.6) return '#f59e0b'
    if (sim >= 0.35) return '#ef4444'
    return '#dc2626'
}

export function DriftPanel({ misalignedPrs, newClusters, driftScore }: Props) {
    const isDrifting = driftScore < 70

    return (
        <div className="glass-card fade-in" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Scope Drift
                </h2>
                <span style={{
                    fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: isDrifting ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                    color: isDrifting ? '#f87171' : '#34d399',
                    border: `1px solid ${isDrifting ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                }}>
                    {isDrifting ? '⚠ DRIFT DETECTED' : '✓ ALIGNED'}
                </span>
            </div>

            {/* Misaligned PRs */}
            {misalignedPrs.length > 0 ? (
                <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>Misaligned PRs (low roadmap similarity)</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {misalignedPrs.slice(0, 5).map((pr, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 14px', background: '#0d0d16', borderRadius: 8,
                                border: '1px solid #1e1e2e',
                            }}>
                                <span style={{ fontSize: 13, color: '#d1d5db', flex: 1, marginRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {pr.title || `PR #${pr.pr_id}`}
                                </span>
                                <span style={{
                                    fontSize: 12, fontWeight: 700, minWidth: 44, textAlign: 'right',
                                    color: getSimilarityColor(pr.similarity),
                                }}>
                                    {(pr.similarity * 100).toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                    {misalignedPrs.length > 5 && (
                        <p style={{ fontSize: 12, color: '#4b5563', marginTop: 8 }}>+{misalignedPrs.length - 5} more misaligned PRs</p>
                    )}
                </div>
            ) : (
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>No misaligned PRs — all PRs align with roadmap.</p>
            )}

            {/* New keyword clusters */}
            {newClusters.length > 0 && (
                <div>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>Emerging clusters (not in roadmap)</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {newClusters.map((cluster, i) => (
                            <span key={i} style={{
                                fontSize: 11, padding: '4px 10px', borderRadius: 12,
                                background: 'rgba(245,158,11,0.10)', color: '#fbbf24',
                                border: '1px solid rgba(245,158,11,0.25)',
                            }}>
                                {cluster}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
