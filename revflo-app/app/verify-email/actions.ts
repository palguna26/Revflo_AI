'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function verifyOtp(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const token = formData.get('code') as string

    if (!email || !token) {
        redirect('/register?error=Missing email or token')
    }

    const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
    })

    if (error) {
        redirect(`/verify-email?email=${encodeURIComponent(email)}&error=${encodeURIComponent(error.message)}`)
    }

    // Success! Redirect to workspace creation onboarding step
    redirect('/onboarding/workspace')
}
