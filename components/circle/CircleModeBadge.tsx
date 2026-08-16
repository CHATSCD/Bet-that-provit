export default function CircleModeBadge({ currency }: { currency: string }) {
  const isRealMoney = currency === 'usd'
  return (
    <span
      className="font-mono text-[8px] px-1.5 py-0.5 tracking-widest uppercase border flex-shrink-0"
      style={{
        color: isRealMoney ? '#00FF88' : '#00CFFF',
        borderColor: isRealMoney ? 'rgba(0,255,136,0.4)' : 'rgba(0,207,255,0.4)',
      }}
    >
      {isRealMoney ? 'Real Money' : 'Free · BetDat'}
    </span>
  )
}
