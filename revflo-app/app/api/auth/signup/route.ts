import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        const supabase = await createClient()

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
            }
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }

        return NextResponse.json({ success: true, redirectTo: '/verify-email' })
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 })
    }
}
