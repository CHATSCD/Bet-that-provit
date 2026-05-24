'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, Bell, User, Wallet } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home',          icon: Home,   label: 'Home' },
  { href: '/wallet',        icon: Wallet, label: 'Wallet' },
  { href: '/circle/create', icon: Plus,   label: 'Create', isPrimary: true },
  { href: '/notifications', icon: Bell,   label: 'Alerts' },
  { href: '/profile',       icon: User,   label: 'Profile' },
]

export default function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#060606] border-t border-[#1a1a1a] safe-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-safe-bottom">
        {NAV_ITEMS.map(({ href, icon: Icon, label, isPrimary }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const isNotif = href === '/notifications'

          if (isPrimary) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 -mt-6">
                <span className="w-14 h-14 flex items-center justify-center bg-[#00FF88] rounded-full shadow-[0_0_20px_rgba(0,255,136,0.5)] active:scale-90 transition-transform">
                  <Icon size={24} className="text-black" strokeWidth={3} />
                </span>
                <span className="text-[9px] tracking-widest text-[#00FF88] uppercase font-ops">{label}</span>
              </Link>
            )
          }

          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 py-1 px-3 relative">
              <Icon
                size={22}
                className={isActive ? 'text-[#00FF88]' : 'text-[#333]'}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {isNotif && unreadCount > 0 && (
                <span className="absolute top-0 right-2 w-4 h-4 bg-[#FF003C] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <span className={`text-[9px] tracking-widest uppercase font-ops ${isActive ? 'text-[#00FF88]' : 'text-[#333]'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
