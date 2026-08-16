'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SelfieCapture from '@/components/kyc/SelfieCapture'
import Button from '@/components/ui/Button'
import { ShieldCheck, Upload, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react'

type KycStatus = 'none' | 'pending' | 'full_approved' | 'rejected'
type Screen = 'trigger' | 'upload_id' | 'selfie' | 'review' | 'pending' | 'approved' | 'rejected'

export default function KycFlow({
  userId,
  mode,
  kycStatus,
  rejectionReason,
  submittedAt,
}: {
  userId: string
  mode: string
  kycStatus: KycStatus
  rejectionReason: string | null
  submittedAt: string | null
}) {
  const router = useRouter()
  const supabase = createClient()

  const initialScreen: Screen =
    kycStatus === 'full_approved' ? 'approved' :
    kycStatus === 'pending' ? 'pending' :
    kycStatus === 'rejected' ? 'rejected' : 'trigger'

  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [idDocFile, setIdDocFile] = useState<File | null>(null)
  const [idDocPreview, setIdDocPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function startVerification() {
    setError('')
    if (mode !== 'real_money') {
      const { error: modeErr } = await supabase.from('profiles').update({ mode: 'real_money' }).eq('id', userId)
      if (modeErr) { setError(modeErr.message); return }
    }
    setScreen('upload_id')
  }

  function onIdFileSelected(file: File) {
    setIdDocFile(file)
    setIdDocPreview(URL.createObjectURL(file))
  }

  async function onSelfieCapture(blob: Blob) {
    if (!idDocFile) return
    setUploading(true)
    setError('')

    const stamp = Date.now()
    const idPath = `${userId}/id-${stamp}.jpg`
    const selfiePath = `${userId}/selfie-${stamp}.jpg`

    const [idUpload, selfieUpload] = await Promise.all([
      supabase.storage.from('kyc-documents').upload(idPath, idDocFile, { contentType: idDocFile.type || 'image/jpeg' }),
      supabase.storage.from('kyc-documents').upload(selfiePath, blob, { contentType: 'image/jpeg' }),
    ])

    if (idUpload.error || selfieUpload.error) {
      setError(idUpload.error?.message ?? selfieUpload.error?.message ?? 'Upload failed')
      setUploading(false)
      return
    }

    const res = await fetch('/api/kyc/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idDocPath: idPath, selfiePath }),
    })
    const data = await res.json()

    if (data.success) {
      setScreen('pending')
      router.refresh()
    } else {
      setError(data.error ?? 'Submission failed')
    }
    setUploading(false)
  }

  return (
    <div className="min-h-dvh bg-black px-5 pt-12 pb-12 flex flex-col">
      <div className="font-mono text-[10px] tracking-[5px] text-[#00FF88] mb-6">IDENTITY VERIFICATION</div>

      {/* TRIGGER */}
      {screen === 'trigger' && (
        <div className="flex flex-col gap-6">
          <ShieldCheck size={40} className="text-[#00FF88]" />
          <div>
            <h1 className="font-ops text-2xl text-white mb-2">Unlock Real Money Mode</h1>
            <p className="font-oswald text-sm text-[#555] leading-relaxed">
              To join paid Circles, use BetIt, and cash out winnings, we need to verify you're 18+ and who you say you are.
              This takes about 2 minutes: a photo ID and a quick selfie.
            </p>
          </div>
          <div className="bg-[#060606] border border-[#0f0f0f] p-4 flex flex-col gap-3">
            {['Government-issued photo ID', 'A quick live selfie', 'Review usually within 24–48 hours'].map(step => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88] flex-shrink-0" />
                <span className="font-oswald text-sm text-[#aaa]">{step}</span>
              </div>
            ))}
          </div>
          {error && <p className="font-mono text-[11px] text-[#FF003C]">{error}</p>}
          <Button onClick={startVerification} fullWidth size="lg">Start Verification</Button>
        </div>
      )}

      {/* UPLOAD ID */}
      {screen === 'upload_id' && (
        <div className="flex flex-col gap-6">
          <div>
            <div className="font-mono text-[10px] tracking-widest text-[#333] uppercase mb-1">Step 1 of 2</div>
            <h1 className="font-ops text-2xl text-white">Upload Your ID</h1>
            <p className="font-oswald text-sm text-[#555] mt-1">Driver's license, passport, or state ID. Make sure all corners are visible.</p>
          </div>

          <label className="relative border-2 border-dashed border-[#1a1a1a] hover:border-[#00FF88] transition-colors aspect-[3/2] flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden">
            {idDocPreview ? (
              <img src={idDocPreview} alt="ID preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <FileText size={28} className="text-[#333]" />
                <span className="font-ops text-xs text-[#333] uppercase tracking-widest">Tap to upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => e.target.files?.[0] && onIdFileSelected(e.target.files[0])}
            />
          </label>

          {error && <p className="font-mono text-[11px] text-[#FF003C]">{error}</p>}
          <Button onClick={() => setScreen('selfie')} disabled={!idDocFile} fullWidth size="lg">
            Continue
          </Button>
        </div>
      )}

      {/* SELFIE */}
      {screen === 'selfie' && (
        <div className="flex flex-col gap-6">
          <div>
            <div className="font-mono text-[10px] tracking-widest text-[#333] uppercase mb-1">Step 2 of 2</div>
            <h1 className="font-ops text-2xl text-white">Take a Selfie</h1>
            <p className="font-oswald text-sm text-[#555] mt-1">Center your face in the frame, good lighting helps.</p>
          </div>

          <SelfieCapture onCapture={onSelfieCapture} onCancel={() => setScreen('upload_id')} />

          {uploading && (
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#00FF88]">
              <span className="w-3 h-3 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
              Submitting for review...
            </div>
          )}
          {error && <p className="font-mono text-[11px] text-[#FF003C]">{error}</p>}
        </div>
      )}

      {/* PENDING */}
      {screen === 'pending' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <Clock size={40} className="text-[#FFD700]" />
          <h1 className="font-ops text-2xl text-white">Under Review</h1>
          <p className="font-oswald text-sm text-[#555] max-w-xs leading-relaxed">
            We've got your documents. Review usually takes 24–48 hours — you'll see Real Money Mode unlock automatically once approved.
          </p>
          {submittedAt && (
            <p className="font-mono text-[10px] text-[#333] tracking-widest uppercase">
              Submitted {new Date(submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      )}

      {/* APPROVED */}
      {screen === 'approved' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <CheckCircle2 size={44} className="text-[#00FF88]" />
          <h1 className="font-ops text-2xl text-white">Verified</h1>
          <p className="font-oswald text-sm text-[#555] max-w-xs leading-relaxed">
            You're all set. Real Money Mode is unlocked — join paid Circles, earn BetIt, and cash out.
          </p>
          <Button onClick={() => router.push('/wallet')} size="lg">Go to Wallet</Button>
        </div>
      )}

      {/* REJECTED */}
      {screen === 'rejected' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <XCircle size={44} className="text-[#FF003C]" />
          <h1 className="font-ops text-2xl text-white">Verification Failed</h1>
          <p className="font-oswald text-sm text-[#555] max-w-xs leading-relaxed">
            {rejectionReason ?? "We couldn't verify your documents."}
          </p>
          <Button onClick={() => { setIdDocFile(null); setIdDocPreview(null); setScreen('upload_id') }} size="lg">
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
