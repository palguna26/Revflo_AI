import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Securely infer email straight from auth session mapping to guard abusive pushes
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !user.email) {
            return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
        }

        const { error } = await supabase
            .from('waitlist')
            .insert({ email: user.email })

        if (error && error.code !== '23505') { // 23505 is Postgres unique violation
            console.error('Waitlist Insert Error:', error)
            return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        console.error('Waitlist POST Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
