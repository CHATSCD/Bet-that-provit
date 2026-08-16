'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [oauthError, setOauthError] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [checkYourEmail, setCheckYourEmail] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (err) setOauthError(err)
  }, [])

  async function signIn(provider: 'google' | 'apple') {
    setLoading(provider)
    setOauthError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: provider === 'apple' ? { response_mode: 'form_post' } : undefined,
      },
    })
    if (error) {
      setOauthError(error.message)
      setLoading(null)
    }
    // On success the browser navigates away to the provider — no need to reset loading.
  }

  async function handleEmailAuth() {
    setEmailError('')
    setCheckYourEmail(false)
    if (!email || !password) { setEmailError('Enter an email and password'); return }
    if (mode === 'signup' && password.length < 6) { setEmailError('Password must be at least 6 characters'); return }

    setLoading('email')

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setEmailError(error.message)
        setLoading(null)
        return
      }
      router.push('/home')
      router.refresh()
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setEmailError(error.message)
        setLoading(null)
        return
      }
      if (data.session) {
        router.push('/onboarding')
        router.refresh()
      } else {
        setCheckYourEmail(true)
        setLoading(null)
      }
    }
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden">
      {/* Background glitch lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-[rgba(0,255,136,0.15)] to-transparent"
            style={{ top: `${10 + i * 12}%`, left: 0, right: 0 }}
          />
        ))}
      </div>

      {/* Logo block */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <div className="font-mono text-[11px] tracking-[6px] text-[#00FF88] opacity-60 uppercase mb-2">
          @illprovit
        </div>

        <h1
          className="font-ops text-6xl text-white"
          style={{ textShadow: '0 0 40px rgba(0,255,136,0.3)' }}
          data-text="illProvIt"
        >
          illProvIt
        </h1>

        <div className="font-ops text-lg text-[#00FF88] tracking-widest">
          Stop Talking. #ProvIt.
        </div>

        <p className="font-oswald text-[#333] text-sm max-w-xs leading-relaxed mt-4">
          Truth or Dare has been reborn in the meta. Challenge your circle. Put real money in. #BetThat.
        </p>
      </div>

      {/* Auth buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {oauthError && (
          <div className="bg-[rgba(255,0,60,0.08)] border border-[rgba(255,0,60,0.3)] px-4 py-3">
            <p className="font-mono text-[11px] text-[#FF003C] leading-relaxed">{oauthError}</p>
          </div>
        )}

        <button
          onClick={() => signIn('google')}
          disabled={loading !== null}
          className="w-full py-4 bg-white text-black font-ops text-sm tracking-widest uppercase flex items-center justify-center gap-3 disabled:opacity-40 active:scale-95 transition-transform"
        >
          {loading === 'google' ? (
            <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        <button
          onClick={() => signIn('apple')}
          disabled={loading !== null}
          className="w-full py-4 bg-[#0a0a0a] border border-[#1a1a1a] text-white font-ops text-sm tracking-widest uppercase flex items-center justify-center gap-3 disabled:opacity-40 active:scale-95 transition-transform"
        >
          {loading === 'apple' ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.37.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.53 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          )}
          Continue with Apple
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-[#1a1a1a]" />
          <span className="font-mono text-[9px] text-[#333] tracking-widest uppercase">or</span>
          <div className="flex-1 h-px bg-[#1a1a1a]" />
        </div>

        {/* Email / password */}
        {checkYourEmail ? (
          <div className="bg-[rgba(0,255,136,0.05)] border border-[rgba(0,255,136,0.2)] px-4 py-4 text-center">
            <p className="font-ops text-sm text-[#00FF88] mb-1">Check your inbox</p>
            <p className="font-oswald text-xs text-[#555]">We sent a confirmation link to {email}.</p>
          </div>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-oswald text-sm px-4 py-3.5 outline-none focus:border-[#00FF88] transition-colors placeholder:text-[#333]"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-oswald text-sm px-4 py-3.5 outline-none focus:border-[#00FF88] transition-colors placeholder:text-[#333]"
            />

            {emailError && (
              <p className="font-mono text-[11px] text-[#FF003C] tracking-wide">{emailError}</p>
            )}

            <button
              onClick={handleEmailAuth}
              disabled={loading !== null}
              className="w-full py-4 bg-[#00FF88] text-black font-ops text-sm tracking-widest uppercase disabled:opacity-40 active:scale-95 transition-transform"
            >
              {loading === 'email' ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                </span>
              ) : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

            <button
              onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setEmailError('') }}
              className="font-mono text-[10px] text-[#333] tracking-widest uppercase text-center hover:text-[#00FF88] transition-colors"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </>
        )}

        <p className="text-center font-mono text-[10px] text-[#1a1a1a] mt-2 leading-relaxed">
          By continuing you agree to our Terms of Service. Must be 18+ to participate in paid circles.
        </p>
      </div>
    </div>
  )
}
