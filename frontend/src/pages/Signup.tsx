import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { createOrg } from '../lib/api'

export function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [orgName, setOrgName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSignup = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) {
            setLoading(false)
            return setError(signUpError.message)
        }

        // Create organization immediately after sign-up
        try {
            await createOrg(orgName || `${email.split('@')[0]}'s Org`)
        } catch {
            // Non-fatal: org can be created later
        }

        setLoading(false)
        navigate('/dashboard')
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 400 }}>
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>RevFlo</h1>
                    <p style={{ color: '#6b7280', fontSize: 14, marginTop: 6 }}>Execution clarity for founders</p>
                </div>

                <div className="glass-card" style={{ padding: 32 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Create account</h2>

                    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={labelStyle}>Work email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                style={inputStyle} placeholder="you@startup.com" />
                        </div>
                        <div>
                            <label style={labelStyle}>Password</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                style={inputStyle} placeholder="Min 6 characters" minLength={6} />
                        </div>
                        <div>
                            <label style={labelStyle}>Organization name</label>
                            <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)}
                                style={inputStyle} placeholder="Acme Inc." />
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px' }}>
                                <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={primaryBtn}>
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    )
}

const labelStyle: React.CSSProperties = { fontSize: 13, color: '#9ca3af', display: 'block', marginBottom: 6 }
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: '#0d0d16',
    border: '1px solid #1e1e2e', borderRadius: 8, color: '#e4e4f0',
    fontSize: 14, outline: 'none',
}
const primaryBtn: React.CSSProperties = {
    width: '100%', padding: '12px 20px', background: '#6366f1',
    color: '#fff', border: 'none', borderRadius: 8, fontSize: 14,
    fontWeight: 600, cursor: 'pointer', marginTop: 4,
}
