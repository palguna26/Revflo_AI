/** Circular Execution Score card with animated ring and breakdown */
import type { ScoreBreakdown } from '../../types'

interface Props {
    score: number
    breakdown: ScoreBreakdown
}

function getScoreColor(score: number): string {
    if (score >= 70) return '#10b981'
    if (score >= 45) return '#f59e0b'
    return '#ef4444'
}

function getScoreLabel(score: number): string {
    if (score >= 70) return 'Strong'
    if (score >= 45) return 'Moderate'
    return 'At Risk'
}

interface MetricRowProps { label: string; value: number; weight: string }
function MetricRow({ label, value, weight }: MetricRowProps) {
    const color = getScoreColor(value)
    const barWidth = `${value}%`
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>{label} <span style={{ color: '#4b5563', fontSize: 11 }}>{weight}</span></span>
                <span style={{ fontSize: 13, fontWeight: 600, color }}>{value.toFixed(0)}</span>
            </div>
            <div style={{ height: 4, background: '#1e1e2e', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: barWidth, background: color, borderRadius: 2, transition: 'width 1s ease' }} />
            </div>
        </div>
    )
}

export function ExecutionScoreCard({ score, breakdown }: Props) {
    const radius = 70
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const color = getScoreColor(score)

    return (
        <div className="glass-card fade-in" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>
                Execution Health Score
            </h2>

            {/* Ring */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                <div style={{ position: 'relative', width: 180, height: 180 }}>
                    <svg width={180} height={180} viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Track */}
                        <circle cx={90} cy={90} r={radius} fill="none" stroke="#1e1e2e" strokeWidth={12} />
                        {/* Progress */}
                        <circle
                            cx={90} cy={90} r={radius} fill="none"
                            stroke={color} strokeWidth={12}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="score-ring"
                            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${color}60)` }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: 40, fontWeight: 800, color, lineHeight: 1 }}>{Math.round(score)}</span>
                        <span style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{getScoreLabel(score)}</span>
                    </div>
                </div>
            </div>

            {/* Breakdown bars */}
            <div>
                <MetricRow label="Velocity Stability" value={breakdown.velocity} weight="30%" />
                <MetricRow label="Scope Control" value={breakdown.scope} weight="25%" />
                <MetricRow label="Review Efficiency" value={breakdown.review} weight="20%" />
                <MetricRow label="Fragmentation Risk" value={breakdown.fragmentation} weight="15%" />
                <MetricRow label="Drift Risk" value={breakdown.drift} weight="10%" />
            </div>
        </div>
    )
}
