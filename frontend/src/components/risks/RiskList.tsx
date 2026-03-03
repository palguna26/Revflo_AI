import type { RiskItem } from '../../types'

interface Props { risks: RiskItem[] }

const SEVERITY_CONFIG = {
    high: { badge: 'badge-high', label: '● HIGH', icon: '⚠' },
    medium: { badge: 'badge-medium', label: '● MED', icon: '⚡' },
    low: { badge: 'badge-low', label: '● LOW', icon: 'ℹ' },
} as const

const TYPE_LABELS: Record<string, string> = {
    velocity: 'Velocity',
    scope: 'Scope',
    review: 'Review',
    fragmentation: 'Fragmentation',
    drift: 'Drift',
}

export function RiskList({ risks }: Props) {
    if (!risks.length) {
        return (
            <div className="glass-card fade-in" style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <p style={{ color: '#10b981', fontWeight: 600 }}>No risks detected</p>
                <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Execution looks healthy across all dimensions.</p>
            </div>
        )
    }

    const sorted = [...risks].sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 }
        return order[a.severity] - order[b.severity]
    })

    return (
        <div className="glass-card fade-in" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                Risk Flags ({risks.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sorted.map((risk, i) => {
                    const cfg = SEVERITY_CONFIG[risk.severity]
                    return (
                        <div key={i} style={{
                            padding: '14px 16px',
                            background: '#0d0d16',
                            borderRadius: 8,
                            border: '1px solid #1e1e2e',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <span className={cfg.badge} style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                                    {cfg.label}
                                </span>
                                <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 500 }}>
                                    {TYPE_LABELS[risk.type] || risk.type}
                                </span>
                            </div>
                            <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>{risk.message}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
