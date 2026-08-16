'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import { RotateCcw, Check, X, Camera } from 'lucide-react'

export default function SelfieCapture({
  onCapture,
  onCancel,
}: {
  onCapture: (blob: Blob) => void
  onCancel: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setReady(true)
      }
    } catch {
      setError('Camera access denied. Enable camera permissions to verify your identity.')
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [startCamera])

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0)

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center bg-[#060606] border border-[#1a1a1a]">
        <Camera size={40} className="text-[#FF003C]" />
        <p className="font-oswald text-sm text-[#FF003C]">{error}</p>
        <button onClick={onCancel} className="font-ops text-xs text-[#333] uppercase tracking-widest">Go Back</button>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />
      {preview ? (
        <div className="relative w-full h-full">
          <img src={preview} alt="Selfie preview" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-3 bg-gradient-to-t from-black">
            <button onClick={retake} className="flex-1 flex items-center justify-center gap-2 py-3 border border-[#1a1a1a] font-ops text-xs tracking-widest uppercase text-white">
              <RotateCcw size={14} /> Retake
            </button>
            <button
              onClick={() => previewBlob && onCapture(previewBlob)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00FF88] font-ops text-xs tracking-widest uppercase text-black font-bold"
            >
              <Check size={14} strokeWidth={3} /> Use Photo
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
          <div className="absolute inset-0 flex flex-col">
            <button onClick={onCancel} className="m-4 w-9 h-9 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
              <X size={18} className="text-white" />
            </button>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-40 h-52 rounded-full border-2 border-[rgba(0,255,136,0.4)]" />
            </div>
            <div className="p-6 flex items-center justify-center">
              <button
                onClick={capturePhoto}
                disabled={!ready}
                className="w-16 h-16 rounded-full border-4 border-[#00FF88] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
              >
                <div className="w-11 h-11 rounded-full bg-[#00FF88]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
