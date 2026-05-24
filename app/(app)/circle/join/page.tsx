'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function JoinByCodePage() {
  const router = useRouter()
  const supabase = createClient()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function handleDigit(index: number, val: string) {
    const char = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1)
    const next = [...code]
    next[index] = char
    setCode(next)
    if (char && index < 5) inputs.current[index + 1]?.focus()
    if (!char && index > 0) inputs.current[index - 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    const paste = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
    if (paste.length === 6) {
      setCode(paste.split(''))
      inputs.current[5]?.focus()
    }
  }

  async function handleJoin() {
    const fullCode = code.join('')
    if (fullCode.length < 6) { setError('Enter the full 6-digit code'); return }

    setLoading(true)
    setError('')

    const { data: circle, error: dbErr } = await supabase
      .from('circles')
      .select('id, status')
      .eq('invite_code', fullCode)
      .single()

    if (dbErr || !circle) {
      setError('Code not found. Double-check and try again.')
      setLoading(false)
      return
    }

    if (circle.status === 'completed' || circle.status === 'canceled') {
      setError('This circle is no longer active.')
      setLoading(false)
      return
    }

    router.push(`/circle/${circle.id}/join`)
  }

  return (
    <div className="min-h-dvh bg-black px-6 pt-12 pb-12 flex flex-col">
      <div className="flex items-center gap-4 mb-10">
        <Link href="/home"><ChevronLeft size={24} className="text-[#333]" /></Link>
        <div>
          <h1 className="font-ops text-2xl text-white">Enter Code</h1>
          <p className="font-oswald text-xs text-[#333] mt-0.5">6-digit circle access code</p>
        </div>
      </div>

      {/* Code input */}
      <div className="flex gap-3 justify-center mb-8">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputs.current[i] = el }}
            type="text"
            inputMode="text"
            maxLength={1}
            value={digit}
            onChange={e => handleDigit(i, e.target.value)}
            onPaste={handlePaste}
            onKeyDown={e => {
              if (e.key === 'Backspace' && !digit && i > 0) {
                inputs.current[i - 1]?.focus()
              }
            }}
            className={[
              'w-12 h-14 text-center font-ops text-xl bg-[#0a0a0a] border outline-none transition-all',
              digit ? 'border-[#00FF88] text-[#00FF88]' : 'border-[#1a1a1a] text-white',
            ].join(' ')}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {error && <p className="font-mono text-[11px] text-[#FF003C] text-center mb-4 tracking-wide">{error}</p>}

      <Button
        onClick={handleJoin}
        loading={loading}
        disabled={code.join('').length < 6}
        fullWidth
        size="lg"
      >
        Find Circle
      </Button>

      <div className="mt-8 text-center">
        <div className="font-oswald text-xs text-[#1a1a1a] mb-3">or scan a link from someone who called you out</div>
        <Link href="/circle/create">
          <span className="font-mono text-[10px] text-[#333] tracking-widest uppercase">
            Create your own instead →
          </span>
        </Link>
      </div>
    </div>
  )
}
