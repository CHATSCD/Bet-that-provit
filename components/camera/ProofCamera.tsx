'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, RotateCcw, Check, X } from 'lucide-react'

interface ProofCameraProps {
  username: string
  onCapture: (blob: Blob, watermarkText: string) => void
  onCancel: () => void
}

export default function ProofCamera({ username, onCapture, onCancel }: ProofCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [watermarkText, setWatermarkText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [ready, setReady] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setReady(true)
      }
    } catch (e) {
      setError('Camera access denied. Enable camera permissions to submit proof.')
    }
  }, [facingMode])

  useEffect(() => {
    startCamera()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [startCamera])

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const W = video.videoWidth
    const H = video.videoHeight
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d')!

    // Mirror for front camera
    if (facingMode === 'user') {
      ctx.translate(W, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, W, H)

    if (facingMode === 'user') {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }

    // Build watermark text
    const now = new Date()
    const timestamp = now.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
    const wm = `@illprovit • ${username} • ${timestamp}`
    setWatermarkText(wm)

    // Draw watermark bar
    const barH = 36
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.fillRect(0, H - barH, W, barH)

    // Watermark text
    ctx.font = `bold ${Math.max(12, W / 55)}px "JetBrains Mono", monospace`
    ctx.fillStyle = '#00FF88'
    ctx.textAlign = 'left'
    ctx.fillText(wm, 12, H - 10)

    // illProvIt logo corner
    ctx.font = `bold ${Math.max(14, W / 48)}px "Black Ops One", cursive`
    ctx.fillStyle = '#00FF88'
    ctx.textAlign = 'right'
    ctx.shadowColor = '#00FF88'
    ctx.shadowBlur = 8
    ctx.fillText('#BetThat', W - 12, 32)
    ctx.shadowBlur = 0

    canvas.toBlob(blob => {
      if (blob) {
        setPreviewBlob(blob)
        setPreview(canvas.toDataURL('image/jpeg', 0.92))
        streamRef.current?.getTracks().forEach(t => t.stop())
      }
    }, 'image/jpeg', 0.92)
  }

  function retake() {
    setPreview(null)
    setPreviewBlob(null)
    startCamera()
  }

  function confirmCapture() {
    if (previewBlob) {
      onCapture(previewBlob, watermarkText)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <Camera size={48} className="text-[#FF003C]" />
        <p className="font-ops text-[#FF003C]">{error}</p>
        <button onClick={onCancel} className="font-ops text-sm text-[#333] uppercase tracking-widest">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-black flex flex-col">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {preview ? (
        /* Preview Mode */
        <div className="relative flex-1">
          <img src={preview} alt="Proof preview" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 p-6 flex gap-4 bg-gradient-to-t from-black">
            <button
              onClick={retake}
              className="flex-1 flex items-center justify-center gap-2 py-4 border border-[#1a1a1a] font-ops text-sm tracking-widest uppercase text-white hover:border-[#333]"
            >
              <RotateCcw size={16} />
              Retake
            </button>
            <button
              onClick={confirmCapture}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#00FF88] font-ops text-sm tracking-widest uppercase text-black font-bold shadow-[0_0_20px_rgba(0,255,136,0.4)]"
            >
              <Check size={16} strokeWidth={3} />
              Submit
            </button>
          </div>
        </div>
      ) : (
        /* Live Camera Mode */
        <div className="relative flex-1">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
          />

          {/* Overlay UI */}
          <div className="absolute inset-0 flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between p-4">
              <button onClick={onCancel} className="w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                <X size={20} className="text-white" />
              </button>
              <div className="font-ops text-xs text-[#00FF88] tracking-widest uppercase bg-black bg-opacity-50 px-3 py-1.5">
                Live Camera Only
              </div>
              <button
                onClick={() => setFacingMode(f => f === 'user' ? 'environment' : 'user')}
                className="w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center"
              >
                <RotateCcw size={20} className="text-white" />
              </button>
            </div>

            {/* Focus frame */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-[rgba(0,255,136,0.4)] relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00FF88]" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00FF88]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00FF88]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00FF88]" />
              </div>
            </div>

            {/* Bottom - Capture button */}
            <div className="p-8 flex items-center justify-center">
              <button
                onClick={capturePhoto}
                disabled={!ready}
                className="w-20 h-20 rounded-full border-4 border-[#00FF88] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30 shadow-[0_0_20px_rgba(0,255,136,0.4)]"
              >
                <div className="w-14 h-14 rounded-full bg-[#00FF88]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
