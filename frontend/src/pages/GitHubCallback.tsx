import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMe, githubCallback } from '../lib/api'

export function GitHubCallbackPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const { data: profile } = useQuery({ queryKey: ['me'], queryFn: getMe, retry: 1 })

    useEffect(() => {
        const code = searchParams.get('code')
        const orgId = searchParams.get('state') || profile?.organization?.id

        if (!code || !orgId) {
            navigate('/dashboard')
            return
        }

        githubCallback(code, orgId)
            .then(() => navigate('/dashboard'))
            .catch(() => navigate('/dashboard'))
    }, [searchParams, profile, navigate])

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--color-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔗</div>
                <p style={{ color: '#9ca3af', fontSize: 16 }}>Connecting GitHub…</p>
            </div>
        </div>
    )
}
