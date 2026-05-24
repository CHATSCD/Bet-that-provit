import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Zap, Plus } from 'lucide-react'
import BuyCoinButton from './BuyCoinButton'

export default async function WalletPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: coinPacks }, { data: coinHistory }] = await Promise.all([
    supabase.from('users').select('username, coin_balance').eq('id', user.id).single(),
    supabase.from('coin_packs').select('*').order('price_cents'),
    supabase.from('coin_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
  ])

  return (
    <div className="min-h-dvh bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 border-b border-[#0f0f0f]">
        <div className="font-mono text-[10px] tracking-[5px] text-[#00FF88] mb-3">WALLET</div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)] flex items-center justify-center">
            <Zap size={22} className="text-[#FFD700]" />
          </div>
          <div>
            <div className="font-ops text-4xl text-white">{profile?.coin_balance ?? 0}</div>
            <div className="font-mono text-[10px] text-[#333] tracking-widest uppercase">ProvCoins</div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-6">

        {/* Coin Packs */}
        <section>
          <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Buy Coins</h2>
          <div className="flex flex-col gap-2">
            {coinPacks?.map(pack => {
              const totalCoins = pack.coins + pack.bonus_coins
              return (
                <div
                  key={pack.id}
                  className={[
                    'flex items-center gap-4 p-4 border transition-all',
                    pack.is_featured
                      ? 'border-[#00FF88] bg-[rgba(0,255,136,0.03)] shadow-[0_0_15px_rgba(0,255,136,0.08)]'
                      : 'border-[#0f0f0f] bg-[#060606]',
                  ].join(' ')}
                >
                  {pack.is_featured && (
                    <div className="absolute -mt-9 right-5">
                      <span className="font-ops text-[9px] bg-[#00FF88] text-black px-2 py-0.5 tracking-widest">BEST VALUE</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-ops text-lg text-white">{pack.name}</span>
                      {pack.bonus_coins > 0 && (
                        <span className="font-mono text-[9px] text-[#00FF88] tracking-widest">+{pack.bonus_coins} BONUS</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Zap size={10} className="text-[#FFD700]" />
                      <span className="font-ops text-sm text-[#FFD700]">{totalCoins} coins</span>
                    </div>
                  </div>
                  <BuyCoinButton packId={pack.id} price={pack.price_cents} label={`$${(pack.price_cents / 100).toFixed(2)}`} />
                </div>
              )
            })}
          </div>
        </section>

        {/* Transaction History */}
        <section>
          <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Coin History</h2>
          {coinHistory && coinHistory.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {coinHistory.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-[#060606]">
                  <div>
                    <div className="font-oswald text-sm text-white">{tx.description ?? tx.type}</div>
                    <div className="font-mono text-[9px] text-[#333]">
                      {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={`font-ops text-base ${tx.amount > 0 ? 'text-[#00FF88]' : 'text-[#FF003C]'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="font-ops text-sm text-[#333]">No transactions yet.</div>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
