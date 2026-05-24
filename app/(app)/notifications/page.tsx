import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const NOTIF_ICONS: Record<string, string> = {
  strike_received:   '⚡',
  bomb_incoming:     '💣',
  bomb_detonated:    '💥',
  bomb_defused:      '✂️',
  shield_activated:  '🛡️',
  personal_challenge:'🎯',
  proof_invalidated: '❌',
  circle_started:    '🏁',
  circle_ended:      '🏆',
  winner_announced:  '👑',
  new_member:        '👤',
}

export default async function NotificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Mark all as read
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return (
    <div className="min-h-dvh bg-black">
      <div className="px-5 pt-12 pb-5 border-b border-[#0f0f0f]">
        <div className="font-mono text-[10px] tracking-[5px] text-[#00FF88] mb-1">ALERTS</div>
        <h1 className="font-ops text-2xl text-white">Notifications</h1>
      </div>

      <div className="flex flex-col">
        {notifications && notifications.length > 0 ? (
          notifications.map(n => (
            <div
              key={n.id}
              className={[
                'flex items-start gap-3 px-5 py-4 border-b border-[#060606]',
                !n.is_read ? 'bg-[rgba(0,255,136,0.02)]' : '',
              ].join(' ')}
            >
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#060606] border border-[#0f0f0f] text-xl">
                {NOTIF_ICONS[n.type] ?? '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-ops text-sm text-white">{n.title}</div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-[#00FF88] flex-shrink-0 mt-1" />}
                </div>
                <div className="font-oswald text-xs text-[#444] mt-0.5 leading-relaxed">{n.body}</div>
                <div className="font-mono text-[9px] text-[#222] mt-1">
                  {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="font-ops text-4xl mb-4">🔔</div>
            <div className="font-ops text-sm text-[#333]">All clear.</div>
            <div className="font-oswald text-xs text-[#222] mt-1">No strikes. No bombs. No drama.</div>
          </div>
        )}
      </div>
    </div>
  )
}
