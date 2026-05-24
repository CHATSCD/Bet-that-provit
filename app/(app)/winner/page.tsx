import { Suspense } from 'react'
import WinnerClient from './WinnerClient'

export default function WinnerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <WinnerClient />
    </Suspense>
  )
}
