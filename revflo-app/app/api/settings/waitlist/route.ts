import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('waitlist')
            .insert({ email })

        // 23505 is the Postgres unique violation code, meaning they are already on the waitlist
        if (error && error.code !== '23505') {
            console.error('Waitlist Insert Error:', error)
            return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        console.error('Waitlist POST Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
