import type { Tables } from '@/lib/supabase/types'

export default function PlaythroughBar({ entry }: { entry: Tables<'playthrough_ledger'> }) {
  const pct = Math.min(100, Math.round((entry.played_amount / entry.required_playthrough) * 100))

  return (
    <div className="bg-[#060606] border border-[#0f0f0f] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-oswald text-xs text-[#aaa] uppercase tracking-wide">
          {entry.bonus_amount} bonus {entry.currency.toUpperCase()}
        </span>
        <span className="font-mono text-[10px] text-[#333]">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-[#0f0f0f]">
        <div className="h-full bg-[#00FF88] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
