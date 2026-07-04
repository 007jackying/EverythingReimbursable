'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from './Icon'

const TABS = [
  { href: '/home', label: 'Home', icon: 'home' },
  { href: '/history', label: 'History', icon: 'history' }
] as const

const RIGHT_TABS = [{ href: '/profile', label: 'Profile', icon: 'person' }] as const

const Tab = ({
  href,
  label,
  icon,
  active
}: {
  href: string
  label: string
  icon: string
  active: boolean
}) => (
  <Link
    href={href}
    className="flex min-w-16 flex-col items-center gap-1 py-1 transition-transform active:scale-90"
    aria-current={active ? 'page' : undefined}
  >
    <span className={`rounded-2xl p-3 ${active ? 'bg-primary-container' : ''}`}>
      <Icon name={icon} filled={active} className={active ? 'text-on-primary' : 'text-primary/60'} />
    </span>
    <span
      className={`font-label text-[10px] font-bold uppercase tracking-[0.15em] ${
        active ? 'text-primary' : 'text-primary/60'
      }`}
    >
      {label}
    </span>
  </Link>
)

const TabBar = () => {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[640px] -translate-x-1/2 rounded-t-3xl bg-background/80 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="flex items-end justify-around px-2 pt-2">
        {TABS.map((tab) => (
          <Tab key={tab.href} {...tab} active={pathname.startsWith(tab.href)} />
        ))}

        {/* Scan FAB */}
        <Link
          href="/scan"
          className="relative flex min-w-16 flex-col items-center"
          aria-label="Scan a receipt"
        >
          <span className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-secondary shadow-2xl ring-8 ring-background transition-transform active:scale-95">
            <Icon name="document_scanner" size={28} className="text-on-secondary" />
          </span>
          <span className="pb-1 pt-1 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-secondary">
            Scan
          </span>
        </Link>

        {RIGHT_TABS.map((tab) => (
          <Tab key={tab.href} {...tab} active={pathname.startsWith(tab.href)} />
        ))}
      </div>
    </nav>
  )
}

export default TabBar
