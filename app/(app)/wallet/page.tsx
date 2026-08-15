import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Coins, ShieldCheck, Gem, ArrowRight } from 'lucide-react'
import BuyPackageButton from './BuyPackageButton'
import PlaythroughBar from './PlaythroughBar'

const BETDAT_PACKAGES = [
  { id: 'betdat_2500',  coins: 2500,  price: 199 },
  { id: 'betdat_12000', coins: 12000, price: 799 },
  { id: 'betdat_40000', coins: 40000, price: 1999 },
]
const BETIT_PACKAGES = [
  { id: 'betit_2500',  coins: 2500,  price: 499 },
  { id: 'betit_12000', coins: 12000, price: 1999 },
  { id: 'betit_40000', coins: 40000, price: 4999 },
]
const PROVCOIN_PACKAGES = [
  { id: 'provcoins_50',  coins: 50,  price: 499 },
  { id: 'provcoins_220', coins: 220, price: 1999 },
  { id: 'provcoins_600', coins: 600, price: 4999 },
]

export default async function WalletPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: ledger }, { data: history }] = await Promise.all([
    supabase.from('profiles')
      .select('mode, kyc_status, can_redeem, betdat_balance, betit_balance, provcoins_balance')
      .eq('id', user.id)
      .single(),
    supabase.from('playthrough_ledger')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('created_at'),
    supabase.from('coin_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const isRealMoney = profile?.mode === 'real_money'
  const isKycApproved = profile?.kyc_status === 'full_approved'

  return (
    <div className="min-h-dvh bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 border-b border-[#0f0f0f]">
        <div className="flex items-center justify-between mb-3">
          <div className="font-mono text-[10px] tracking-[5px] text-[#00FF88]">WALLET</div>
          <span className={`font-mono text-[9px] px-2 py-1 tracking-widest uppercase border ${isRealMoney ? 'border-[#00FF88] text-[#00FF88]' : 'border-[#00CFFF] text-[#00CFFF]'}`}>
            {isRealMoney ? 'Real Money' : 'Free Mode'}
          </span>
        </div>

        {!isRealMoney ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[rgba(0,207,255,0.1)] border border-[rgba(0,207,255,0.3)] flex items-center justify-center">
              <Coins size={22} className="text-[#00CFFF]" />
            </div>
            <div>
              <div className="font-ops text-4xl text-white">{profile?.betdat_balance ?? 0}</div>
              <div className="font-mono text-[10px] text-[#333] tracking-widest uppercase">BetDat · not redeemable</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-3 bg-[#060606] border border-[#0f0f0f] p-3">
              <ShieldCheck size={18} className="text-[#00FF88] flex-shrink-0" />
              <div>
                <div className="font-ops text-xl text-white">{profile?.betit_balance ?? 0}</div>
                <div className="font-mono text-[9px] text-[#333] tracking-widest uppercase">BetIt</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#060606] border border-[#0f0f0f] p-3">
              <Gem size={18} className="text-[#FFD700] flex-shrink-0" />
              <div>
                <div className="font-ops text-xl text-white">{profile?.provcoins_balance ?? 0}</div>
                <div className="font-mono text-[9px] text-[#333] tracking-widest uppercase">ProvCoins</div>
              </div>
            </div>
          </div>
        )}

        {!isRealMoney && (
          <Link href="/kyc" className="mt-4 flex items-center justify-between bg-[rgba(0,255,136,0.04)] border border-[rgba(0,255,136,0.2)] px-4 py-3">
            <span className="font-ops text-xs text-[#00FF88] tracking-widest uppercase">Unlock Real Money Mode</span>
            <ArrowRight size={14} className="text-[#00FF88]" />
          </Link>
        )}

        {isRealMoney && !isKycApproved && (
          <Link href="/kyc" className="mt-4 flex items-center justify-between bg-[rgba(255,215,0,0.05)] border border-[rgba(255,215,0,0.2)] px-4 py-3">
            <span className="font-ops text-xs text-[#FFD700] tracking-widest uppercase">
              {profile?.kyc_status === 'pending' ? 'Verification pending' : 'Finish verification to join Circles'}
            </span>
            <ArrowRight size={14} className="text-[#FFD700]" />
          </Link>
        )}

        {isRealMoney && isKycApproved && (
          <Link href="/redeem" className="mt-4 flex items-center justify-between bg-[rgba(0,255,136,0.04)] border border-[rgba(0,255,136,0.2)] px-4 py-3">
            <span className="font-ops text-xs text-[#00FF88] tracking-widest uppercase">Redeem BetIt for Cash</span>
            <ArrowRight size={14} className="text-[#00FF88]" />
          </Link>
        )}
      </div>

      <div className="px-5 py-4 flex flex-col gap-6">

        {/* Playthrough progress */}
        {ledger && ledger.length > 0 && (
          <section>
            <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Playthrough Progress</h2>
            <div className="flex flex-col gap-2">
              {ledger.map(l => <PlaythroughBar key={l.id} entry={l} />)}
            </div>
            <p className="font-mono text-[9px] text-[#333] mt-2 leading-relaxed">
              Bonus coins unlock 1:1 as you play. Purchased/earned coins are always usable immediately.
            </p>
          </section>
        )}

        {/* Buy packages */}
        {!isRealMoney ? (
          <section>
            <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Buy BetDat</h2>
            <div className="flex flex-col gap-2">
              {BETDAT_PACKAGES.map(pkg => (
                <PackageRow key={pkg.id} id={pkg.id} coins={pkg.coins} price={pkg.price} label="BetDat" color="#00CFFF" />
              ))}
            </div>
          </section>
        ) : (
          <>
            <section>
              <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Buy BetIt</h2>
              <div className="flex flex-col gap-2">
                {BETIT_PACKAGES.map(pkg => (
                  <PackageRow key={pkg.id} id={pkg.id} coins={pkg.coins} price={pkg.price} label="BetIt" color="#00FF88" />
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">Buy ProvCoins</h2>
              <div className="flex flex-col gap-2">
                {PROVCOIN_PACKAGES.map(pkg => (
                  <PackageRow key={pkg.id} id={pkg.id} coins={pkg.coins} price={pkg.price} label="ProvCoins" color="#FFD700" />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Transaction History */}
        <section>
          <h2 className="font-ops text-xs tracking-widest uppercase text-[#333] mb-3">History</h2>
          {history && history.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {history.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-[#060606]">
                  <div>
                    <div className="font-oswald text-sm text-white">{tx.description ?? tx.type}</div>
                    <div className="font-mono text-[9px] text-[#333]">
                      {tx.currency ? `${tx.currency.toUpperCase()} · ` : ''}
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

function PackageRow({ id, coins, price, label, color }: { id: string; coins: number; price: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-[#0f0f0f] bg-[#060606]">
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <Coins size={10} style={{ color }} />
          <span className="font-ops text-sm" style={{ color }}>{coins.toLocaleString()} {label}</span>
        </div>
      </div>
      <BuyPackageButton packageId={id} label={`$${(price / 100).toFixed(2)}`} />
    </div>
  )
}
