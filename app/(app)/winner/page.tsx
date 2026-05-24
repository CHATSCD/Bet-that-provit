'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Share2 } from 'lucide-react'

export default function WinnerPage() {
  const params = useSearchParams()
  const amount = params.get('amount') ?? '0'
  const username = params.get('username') ?? 'Unknown'
  const circleName = params.get('circle') ?? 'The Arena'
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const W = 1080
    const H = 1920
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d')!

    // Background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, W, H)

    // Scanlines
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = 'rgba(0,255,136,0.015)'
      ctx.fillRect(0, y, W, 2)
    }

    // Green border glow
    ctx.strokeStyle = '#00FF88'
    ctx.lineWidth = 4
    ctx.shadowColor = '#00FF88'
    ctx.shadowBlur = 40
    ctx.strokeRect(20, 20, W - 40, H - 40)
    ctx.shadowBlur = 0

    // @illprovit header
    ctx.font = 'bold 52px "Black Ops One", cursive'
    ctx.fillStyle = '#00FF88'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#00FF88'
    ctx.shadowBlur = 20
    ctx.fillText('@illprovit', W / 2, 120)
    ctx.shadowBlur = 0

    // #BetThat sub
    ctx.font = '36px "Oswald", sans-serif'
    ctx.fillStyle = '#333333'
    ctx.fillText('#BetThat', W / 2, 168)

    // Winner badge
    ctx.font = '120px serif'
    ctx.textAlign = 'center'
    ctx.fillText('👑', W / 2, 380)

    // Username
    ctx.font = 'bold 96px "Black Ops One", cursive'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.fillText(`@${username}`, W / 2, 520)

    // WIN label
    ctx.font = '52px "Oswald", sans-serif'
    ctx.fillStyle = '#333333'
    ctx.letterSpacing = '20px'
    ctx.fillText('JUST PROVED IT', W / 2, 600)

    // Amount
    ctx.font = 'bold 240px "Black Ops One", cursive'
    ctx.fillStyle = '#00FF88'
    ctx.shadowColor = '#00FF88'
    ctx.shadowBlur = 60
    ctx.textAlign = 'center'
    ctx.fillText(`$${parseFloat(amount).toFixed(0)}`, W / 2, 900)
    ctx.shadowBlur = 0

    ctx.font = '40px "Oswald", sans-serif'
    ctx.fillStyle = '#333333'
    ctx.fillText('CASHED OUT', W / 2, 960)

    // Circle name
    ctx.font = '52px "Black Ops One", cursive'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(circleName, W / 2, 1080)

    // Stop Talking tagline
    ctx.font = 'bold 64px "Black Ops One", cursive'
    ctx.fillStyle = '#00FF88'
    ctx.shadowColor = '#00FF88'
    ctx.shadowBlur = 15
    ctx.fillText('Stop Talking.', W / 2, 1250)
    ctx.fillText('#ProvIt.', W / 2, 1340)
    ctx.shadowBlur = 0

    // Footer
    ctx.font = '38px "Oswald", sans-serif'
    ctx.fillStyle = '#1a1a1a'
    ctx.fillText('illprovit.app', W / 2, H - 60)
  }, [amount, username, circleName])

  function shareReceipt() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(blob => {
      if (!blob) return
      const file = new File([blob], 'illprovit-win.jpg', { type: 'image/jpeg' })
      if (navigator.canShare?.({ files: [file] })) {
        navigator.share({ files: [file], title: `I just won $${amount} on illProvIt! #BetThat` })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'illprovit-win.jpg'
        a.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/jpeg', 0.95)
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col items-center px-5 py-12">
      <div className="font-ops text-[10px] tracking-[5px] text-[#00FF88] mb-6">YOU PROVED IT</div>

      {/* 9:16 Preview (scaled) */}
      <div className="w-full max-w-sm aspect-[9/16] relative overflow-hidden border border-[#1a1a1a] mb-6">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={shareReceipt}
          className="w-full flex items-center justify-center gap-3 py-4 bg-[#00FF88] font-ops text-base tracking-widest uppercase text-black active:scale-95 transition-transform shadow-[0_0_30px_rgba(0,255,136,0.4)]"
        >
          <Share2 size={18} className="text-black" />
          Share to TikTok / Insta
        </button>

        <Link href="/home">
          <button className="w-full py-4 border border-[#1a1a1a] font-ops text-sm tracking-widest uppercase text-[#333] hover:border-[#333] transition-colors">
            Back to Arena
          </button>
        </Link>
      </div>
    </div>
  )
}
