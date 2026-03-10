import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        const body = await request.json()
        const { currentPassword, newPassword } = body

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Both passwords are required' }, { status: 400 })
        }

        // Supabase requires validating the active session with the old password
        // before accepting a new password change securely
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || (!user.email)) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

        // Verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        })

        if (signInError) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
        }

        // Apply new password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (updateError) throw updateError

        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        console.error('Password Update Error:', err)
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }
}
