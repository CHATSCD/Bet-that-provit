'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [dob, setDob] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [loading, setLoading] = useState(false)

  function getAge(dateStr: string) {
    const birth = new Date(dateStr)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
    return age
  }

  async function checkUsername() {
    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (clean.length < 3) { setUsernameError('Min 3 characters'); return }
    if (clean.length > 20) { setUsernameError('Max 20 characters'); return }

    const { data } = await supabase.from('users').select('id').eq('username', clean).single()
    if (data) { setUsernameError('Username taken'); return }

    setUsernameError('')
    setStep(2)
  }

  async function handleSubmit() {
    if (getAge(dob) < 18) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const clean = username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      username: clean,
      date_of_birth: dob,
      is_18_verified: true,
    })

    if (!error) router.push('/home')
    setLoading(false)
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="font-mono text-[10px] tracking-[5px] text-[#00FF88] mb-3">
          STEP {step} OF 2
        </div>
        <div className="w-full h-1 bg-[#0f0f0f] mb-6">
          <div
            className="h-full bg-[#00FF88] transition-all duration-500"
            style={{ width: `${step * 50}%` }}
          />
        </div>
        <h1 className="font-ops text-3xl text-white">
          {step === 1 ? 'Pick Your Handle' : 'Verify Your Age'}
        </h1>
        <p className="font-oswald text-[#333] mt-2 text-sm">
          {step === 1
            ? 'This is how the arena knows you. Choose wisely.'
            : 'You must be 18+ to join paid circles. No exceptions.'}
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
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] text-white font-ops text-lg px-4 py-4 outline-none focus:border-[#00FF88] transition-colors [color-scheme:dark]"
            />
            {dob && getAge(dob) < 18 && (
              <p className="font-mono text-[11px] text-[#FF003C] mt-2 tracking-wide">
                Must be 18+ to participate
              </p>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!dob || getAge(dob) < 18}
            loading={loading}
            fullWidth
            size="lg"
          >
            Enter The Arena
          </Button>
          <button onClick={() => setStep(1)} className="font-mono text-[11px] text-[#333] tracking-widest uppercase text-center">
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
