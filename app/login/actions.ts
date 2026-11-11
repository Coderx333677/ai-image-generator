
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect('/login?error=missing-fields')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=authentication-failed')
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect('/login?error=missing-fields')
  }

  if (password.length < 8) {
    redirect('/login?error=weak-password')
  }

  const supabase = await createClient()

    const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
    })

 if (error) {
  console.error('Supabase signup error:', error.message)
  redirect('/login?error=signup-failed')
}

  if (!data.session) {
    redirect('/login?message=check-email')
  }

  redirect('/')
}

export async function logout() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect('/login')
}
