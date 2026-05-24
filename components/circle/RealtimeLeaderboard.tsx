'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Leaderboard from './Leaderboard'

type Member = {
  user_id: string
  username: string
  avatar_url: string | null
  score: number
  strike_count: number
  status: string
  has_shield: boolean
  rank: number
}

export default function RealtimeLeaderboard({
  circleId,
  initialMembers,
  currentUserId,
}: {
  circleId: string
  initialMembers: Member[]
  currentUserId: string
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const supabase = createClient()

  useEffect(() => {
    async function refresh() {
      const { data } = await supabase
        .from('circle_leaderboard')
        .select('*')
        .eq('circle_id', circleId)
        .order('rank')
      if (data) setMembers(data as Member[])
    }

    // Subscribe to circle_members changes
    const channel = supabase
      .channel(`leaderboard:${circleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'circle_members',
          filter: `circle_id=eq.${circleId}`,
        },
        () => refresh()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'strikes',
          filter: `circle_id=eq.${circleId}`,
        },
        () => refresh()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [circleId])

  return <Leaderboard members={members} currentUserId={currentUserId} />
}
