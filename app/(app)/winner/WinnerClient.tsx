'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Share2 } from 'lucide-react'

export default function WinnerClient() {
  const params = useSearchParams()
  const amount   = params.get('amount')   ?? '0'
  const username = params.get('username') ?? 'Unknown'
  const circleName = params.get('circle') ?? 'The Arena'
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const W = 1080, H = 1920
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // Background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, W, H)

    // Scanlines
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = 'rgba(0,255,136,0.012)'
      ctx.fillRect(0, y, W, 2)
    }

    // Green border
    ctx.strokeStyle = '#00FF88'
    ctx.lineWidth = 6
    ctx.shadowColor = '#00FF88'
    ctx.shadowBlur = 40
    ctx.strokeRect(24, 24, W - 48, H - 48)
    ctx.shadowBlur = 0

    // Header
    ctx.font = 'bold 56px sans-serif'
    ctx.fillStyle = '#00FF88'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#00FF88'
    ctx.shadowBlur = 20
    ctx.fillText('@illprovit', W / 2, 130)
    ctx.shadowBlur = 0

    ctx.font = '40px sans-serif'
    ctx.fillStyle = '#222'
    ctx.fillText('#BetThat', W / 2, 180)

    // Crown emoji
    ctx.font = '160px serif'
    ctx.fillText('👑', W / 2, 420)

    // Username
    ctx.font = 'bold 88px sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(`@${username}`, W / 2, 540)

    // PROVED IT
    ctx.font = '48px sans-serif'
    ctx.fillStyle = '#333'
    ctx.fillText('JUST PROVED IT', W / 2, 610)

    // Amount
    ctx.font = `bold ${amount.length > 4 ? 180 : 220}px sans-serif`
    ctx.fillStyle = '#00FF88'
    ctx.shadowColor = '#00FF88'
    ctx.shadowBlur = 80
    ctx.fillText(`$${parseFloat(amount).toFixed(0)}`, W / 2, 900)
    ctx.shadowBlur = 0

    ctx.font = '44px sans-serif'
    ctx.fillStyle = '#333'
    ctx.fillText('CASHED OUT', W / 2, 970)

    // Circle name
    ctx.font = 'bold 52px sans-serif'
    ctx.fillStyle = '#fff'
    ctx.fillText(circleName.length > 22 ? circleName.slice(0, 22) + '…' : circleName, W / 2, 1080)

    // Tagline
    ctx.font = 'bold 72px sans-serif'
    ctx.fillStyle = '#00FF88'
    ctx.shadowColor = '#00FF88'
    ctx.shadowBlur = 20
    ctx.fillText('Stop Talking.', W / 2, 1260)
    ctx.fillText('#ProvIt.', W / 2, 1360)
    ctx.shadowBlur = 0

    // Footer
    ctx.font = '40px sans-serif'
    ctx.fillStyle = '#111'
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
        Object.assign(document.createElement('a'), { href: url, download: 'illprovit-win.jpg' }).click()
        URL.revokeObjectURL(url)
      }
    }, 'image/jpeg', 0.95)
  }

  return (
    <div className="min-h-dvh bg-black flex flex-col items-center px-5 py-12">
      <div className="font-ops text-[10px] tracking-[5px] text-[#00FF88] mb-6">YOU PROVED IT</div>

      <div className="w-full max-w-xs aspect-[9/16] relative overflow-hidden border border-[#1a1a1a] mb-6 shadow-[0_0_40px_rgba(0,255,136,0.2)]">
        <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: 'crisp-edges' }} />
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <button
          onClick={shareReceipt}
          className="w-full flex items-center justify-center gap-3 py-4 bg-[#00FF88] font-ops text-base tracking-widest uppercase text-black active:scale-95 transition-transform shadow-[0_0_30px_rgba(0,255,136,0.4)]"
        >
          <Share2 size={18} />
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
