import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        const supabase = await createClient()

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 401 })
        }

        return NextResponse.json({ success: true, redirectTo: '/dashboard' })
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 })
    }
}
