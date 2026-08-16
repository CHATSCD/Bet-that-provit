import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  // The provider itself can redirect straight back with an error (user canceled,
  // misconfigured client, etc.) before we ever get a code to exchange.
  const providerError = searchParams.get('error_description') ?? searchParams.get('error')
  if (providerError) {
    console.error('OAuth provider error:', providerError)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(providerError)}`)
  }

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has completed onboarding (age gate + mode selection)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('age_status')
          .eq('id', user.id)
          .single()

        if (!profile || profile.age_status === 'unknown') {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('exchangeCodeForSession failed:', error.message)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('No authorization code returned')}`)
}
