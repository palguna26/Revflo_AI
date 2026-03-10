import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient()

        const body = await request.json()
        const { full_name } = body

        if (!full_name || typeof full_name !== 'string') {
            return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
        }

        const { error } = await supabase.auth.updateUser({
            data: { full_name }
        })

        if (error) throw error

        return NextResponse.json({ success: true, full_name })
    } catch (err: unknown) {
        console.error('Profile PATCH Error:', err)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }
}
