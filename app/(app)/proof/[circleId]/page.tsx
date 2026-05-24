'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProofCamera from '@/components/camera/ProofCamera'
import { CheckCircle } from 'lucide-react'

export default function SubmitProofPage({ params }: { params: { circleId: string } }) {
  const router = useRouter()
  const supabase = createClient()

  const [phase, setPhase] = useState<'camera' | 'uploading' | 'done'>('camera')
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState('user')
  const [pointsAwarded, setPointsAwarded] = useState(10)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('username').eq('id', user.id).single()
      if (data) setUsername(data.username)
    }
    loadUser()
  }, [])

  async function handleCapture(blob: Blob, watermarkText: string) {
    setPhase('uploading')
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const fileName = `${params.circleId}/${user.id}/${Date.now()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('proofs')
      .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false })

    if (uploadError) {
      setError('Upload failed. Check connection and try again.')
      setPhase('camera')
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(fileName)

    // Check if double points is active
    const { data: member } = await supabase
      .from('circle_members')
      .select('score')
      .eq('circle_id', params.circleId)
      .eq('user_id', user.id)
      .single()

    const { data: doublePoints } = await supabase
      .from('active_power_moves')
      .select('id')
      .eq('circle_id', params.circleId)
      .eq('user_id', user.id)
      .eq('move_key', 'double_points')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    const pts = doublePoints ? 20 : 10
    setPointsAwarded(pts)

    const { error: dbError } = await supabase.from('proofs').insert({
      circle_id: params.circleId,
      user_id: user.id,
      image_url: publicUrl,
      watermark_text: watermarkText,
      status: 'pending',
      points_awarded: pts,
      has_double_points: !!doublePoints,
    })

    if (dbError) {
      setError('Failed to record proof. Try again.')
      setPhase('camera')
      return
    }

    // Increment score
    await supabase
      .from('circle_members')
      .update({ score: (member?.score ?? 0) + pts })
      .eq('circle_id', params.circleId)
      .eq('user_id', user.id)

    setPhase('done')
  }

  if (phase === 'camera') {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <ProofCamera
          username={username}
          onCapture={handleCapture}
          onCancel={() => router.back()}
        />
        {error && (
          <div className="absolute bottom-40 left-0 right-0 px-6">
            <div className="bg-[#FF003C] px-4 py-3 font-mono text-xs text-white text-center">{error}</div>
          </div>
        )}
      </div>
    )
  }

  if (phase === 'uploading') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
        <div className="font-ops text-sm text-[#00FF88] tracking-widest">Submitting Proof...</div>
        <div className="font-mono text-[10px] text-[#333] tracking-widest">Burning in watermark</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center gap-6 px-6">
      <div className="w-20 h-20 rounded-full bg-[rgba(0,255,136,0.1)] border border-[#00FF88] flex items-center justify-center shadow-[0_0_40px_rgba(0,255,136,0.3)]">
        <CheckCircle size={40} className="text-[#00FF88]" />
      </div>
      <div className="text-center">
        <div className="font-ops text-3xl text-white mb-2">Proof Submitted</div>
        <div className="font-mono text-[10px] text-[#00FF88] tracking-widest uppercase">
          +{pointsAwarded} PTS{pointsAwarded === 20 ? ' · 2X ACTIVE 🔥' : ''} · #ProvIt
        </div>
      </div>
      <div className="font-oswald text-sm text-[#333] text-center max-w-xs">
        Your circle can now see your proof. Let them try to call #Bullshit.
      </div>
      <button
        onClick={() => router.push(`/circle/${params.circleId}`)}
        className="font-ops text-sm tracking-widest uppercase px-8 py-4 bg-[#00FF88] text-black active:scale-95 transition-transform"
      >
        Back to Circle
      </button>
    </div>
  )
}
