'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { memo } from 'react'

interface NavItem {
  icon: string
  label: string
  href: string
  badge?: number
}

interface MobileBottomNavProps {
  items: NavItem[]
  className?: string
}

const MobileBottomNav = memo(function MobileBottomNav({ items, className = '' }: MobileBottomNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-inset-bottom md:hidden ${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 
                flex-1 h-full touch-target
                transition-smooth
                ${isActive 
                  ? 'text-primary' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
                }
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <span className={`material-symbols-outlined text-2xl ${isActive ? 'fill' : ''}`}>
                  {item.icon}
                </span>
                {item.badge && item.badge > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    aria-label={`${item.badge} notifications`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
)
});
export default MobileBottomNav

