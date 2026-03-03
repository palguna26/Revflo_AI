import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveRoadmap } from '../../lib/api'

interface Props {
    organizationId: string
    repositoryId: string
    initialText?: string
}

export function RoadmapInput({ organizationId, repositoryId, initialText = '' }: Props) {
    const [text, setText] = useState(initialText)
    const [saved, setSaved] = useState(false)
    const qc = useQueryClient()

    const mutation = useMutation({
        mutationFn: () => saveRoadmap(organizationId, repositoryId, text),
        onSuccess: () => {
            setSaved(true)
            qc.invalidateQueries({ queryKey: ['repositories'] })
            setTimeout(() => setSaved(false), 3000)
        },
    })

    return (
        <div className="glass-card fade-in" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                Roadmap
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
                Paste your product roadmap. This text is used to detect scope alignment and drift.
            </p>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Q1: Complete user onboarding, payment integration, and admin dashboard. Q2: Launch mobile app and analytics module..."
                style={{
                    width: '100%', minHeight: 140, resize: 'vertical',
                    background: '#0d0d16', border: '1px solid #1e1e2e', borderRadius: 8,
                    color: '#e4e4f0', padding: '12px 14px', fontSize: 13, lineHeight: 1.6,
                    fontFamily: 'Inter, sans-serif', outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#6366f1' }}
                onBlur={(e) => { e.target.style.borderColor = '#1e1e2e' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
                <button
                    onClick={() => mutation.mutate()}
                    disabled={!text.trim() || mutation.isPending}
                    style={{
                        background: text.trim() && !mutation.isPending ? '#6366f1' : '#1e1e2e',
                        color: text.trim() && !mutation.isPending ? '#fff' : '#4b5563',
                        border: 'none', borderRadius: 8, padding: '10px 20px',
                        fontSize: 13, fontWeight: 600, cursor: text.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                    }}
                >
                    {mutation.isPending ? 'Saving…' : 'Save Roadmap'}
                </button>
                {saved && <span style={{ fontSize: 13, color: '#10b981' }}>✓ Roadmap saved</span>}
                {mutation.isError && <span style={{ fontSize: 13, color: '#ef4444' }}>Failed to save. Try again.</span>}
            </div>
        </div>
    )
}
