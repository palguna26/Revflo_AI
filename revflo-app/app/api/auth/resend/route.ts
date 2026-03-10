import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const email = formData.get('email') as string

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
        })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error('Error resending email:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
