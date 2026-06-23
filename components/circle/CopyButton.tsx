'use client'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2.5 border border-[#1a1a1a] hover:border-[#00FF88] transition-colors"
      title="Copy callout message"
    >
      {copied
        ? <Check size={16} className="text-[#00FF88]" />
        : <Copy size={16} className="text-[#333]" />
      }
    </button>
  )
}
