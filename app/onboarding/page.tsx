'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { Coins, ShieldCheck } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [dob, setDob] = useState('')
  const [mode, setMode] = useState<'free' | 'real_money'>('free')
  const [usernameError, setUsernameError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function getAge(dateStr: string) {
    const birth = new Date(dateStr)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
    return age
  }

  const age = dob ? getAge(dob) : null
  const isAdult = age !== null && age >= 18
  const totalSteps = age !== null && isAdult ? 3 : 2

  async function checkUsername() {
    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (clean.length < 3) { setUsernameError('Min 3 characters'); return }
    if (clean.length > 20) { setUsernameError('Max 20 characters'); return }

    const { data } = await supabase.from('users').select('id').eq('username', clean).single()
    if (data) { setUsernameError('Username taken'); return }

    setUsernameError('')
    setStep(2)
  }

  function submitAge() {
    if (!dob) return
    if (isAdult) {
      setStep(3)
    } else {
      finish('free', 'under_18')
    }
  }

  async function finish(chosenMode: 'free' | 'real_money', ageStatus: 'under_18' | '18_plus') {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '')

    const [{ error: userErr }, { error: profileErr }] = await Promise.all([
      supabase.from('users').upsert({
        id: user.id,
        username: clean,
        date_of_birth: dob,
        is_18_verified: ageStatus === '18_plus',
      }),
      supabase.from('profiles').upsert({
        id: user.id,
        date_of_birth: dob,
        age_status: ageStatus,
        mode: chosenMode,
        age_verified_at: new Date().toISOString(),
        age_verification_method: 'self_attested',
      }),
    ])

    if (userErr || profileErr) {
      setError(userErr?.message ?? profileErr?.message ?? 'Something went wrong')
      setLoading(false)
      return
    }

    if (chosenMode === 'real_money') {
      router.push('/kyc')
    } else {
      router.push('/home')
    }
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="font-mono text-[10px] tracking-[5px] text-[#00FF88] mb-3">
          STEP {step} OF {totalSteps}
        </div>
        <div className="w-full h-1 bg-[#0f0f0f] mb-6">
          <div
            className="h-full bg-[#00FF88] transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
        <h1 className="font-ops text-3xl text-white">
          {step === 1 ? 'Pick Your Handle' : step === 2 ? 'Verify Your Age' : 'Choose Your Mode'}
        </h1>
        <p className="font-oswald text-[#333] mt-2 text-sm">
          {step === 1
            ? 'This is how the arena knows you. Choose wisely.'
            : step === 2
            ? 'Everyone plays. Only 18+ can unlock real-money stakes.'
            : 'You can switch to Real Money later — it just needs ID verification.'}
        </p>
      </div>

      {/* Step 1: Username */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center border border-[#1a1a1a] bg-[#0a0a0a] focus-within:border-[#00FF88] transition-colors">
              <span className="font-ops text-[#00FF88] pl-4 text-lg">@</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="yourhandle"
                maxLength={20}
                className="flex-1 bg-transparent text-white font-ops text-lg px-2 py-4 outline-none placeholder:text-[#1a1a1a]"
                autoFocus
                autoCapitalize="none"
                autoComplete="off"
              />
            </div>
            {usernameError && (
              <p className="font-mono text-[11px] text-[#FF003C] mt-2 tracking-wide">{usernameError}</p>
            )}
          </div>
          <Button onClick={checkUsername} disabled={username.length < 3} fullWidth size="lg">
            Lock It In
          </Button>
        </div>
      )}

      {/* Step 2: Age */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div>
            <label className="font-mono text-[10px] tracking-widest text-[#333] uppercase block mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-ops text-lg px-4 py-4 outline-none focus:border-[#00FF88] transition-colors [color-scheme:dark]"
            />
            {age !== null && !isAdult && (
              <p className="font-mono text-[11px] text-[#00CFFF] mt-2 tracking-wide leading-relaxed">
                You'll play in Free Mode with BetDat — no real-money circles or cash out. That's the rules, no exceptions.
              </p>
            )}
          </div>
          {error && <p className="font-mono text-[11px] text-[#FF003C] tracking-wide">{error}</p>}
          <Button onClick={submitAge} disabled={!dob} loading={loading && !isAdult} fullWidth size="lg">
            Continue
          </Button>
          <button onClick={() => setStep(1)} className="font-mono text-[11px] text-[#333] tracking-widest uppercase text-center">
            ← Back
          </button>
        </div>
      )}

      {/* Step 3: Mode selection (18+ only) */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMode('free')}
              className={[
                'flex items-start gap-4 p-5 border text-left transition-all',
                mode === 'free'
                  ? 'border-[#00CFFF] bg-[rgba(0,207,255,0.05)] shadow-[0_0_20px_rgba(0,207,255,0.15)]'
                  : 'border-[#1a1a1a] bg-[#0a0a0a]',
              ].join(' ')}
            >
              <Coins size={22} className="text-[#00CFFF] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-ops text-base text-white">Free Mode</div>
                <div className="font-oswald text-xs text-[#555] mt-1 leading-relaxed">
                  Play with BetDat. Buy coins &amp; power moves. No real-money circles, no cash out.
                </div>
              </div>
            </button>
            <button
              onClick={() => setMode('real_money')}
              className={[
                'flex items-start gap-4 p-5 border text-left transition-all',
                mode === 'real_money'
                  ? 'border-[#00FF88] bg-[rgba(0,255,136,0.05)] shadow-[0_0_20px_rgba(0,255,136,0.15)]'
                  : 'border-[#1a1a1a] bg-[#0a0a0a]',
              ].join(' ')}
            >
              <ShieldCheck size={22} className="text-[#00FF88] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-ops text-base text-white">Real Money Mode</div>
                <div className="font-oswald text-xs text-[#555] mt-1 leading-relaxed">
                  Play with BetIt &amp; ProvCoins. Join paid circles, cash out winnings. Requires ID verification (KYC) next.
                </div>
              </div>
            </button>
          </div>

          {error && <p className="font-mono text-[11px] text-[#FF003C] tracking-wide">{error}</p>}

          <Button onClick={() => finish(mode, '18_plus')} loading={loading} fullWidth size="lg">
            {mode === 'real_money' ? 'Continue to Verification' : 'Enter The Arena'}
          </Button>
          <button onClick={() => setStep(2)} className="font-mono text-[11px] text-[#333] tracking-widest uppercase text-center">
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
