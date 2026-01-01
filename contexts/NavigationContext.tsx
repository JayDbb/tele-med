'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface NavigationContextType {
  previousPath: string | null
  pushPath: (path: string) => void
  goBack: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const stackRef = useRef<string[]>([])
  const [previousPath, setPreviousPath] = useState<string | null>(null)

  useEffect(() => {
    // When pathname changes, push the old path onto the stack
    if (!pathname) return
    const last = stackRef.current[stackRef.current.length - 1]
    if (last !== pathname) {
      if (last) {
        stackRef.current.push(last)
        setPreviousPath(last)
      }
    }
  }, [pathname])

  const pushPath = (path: string) => {
    stackRef.current.push(path)
    setPreviousPath(stackRef.current[stackRef.current.length - 1] || null)
  }

  const goBack = () => {
    const prev = stackRef.current.pop()
    if (prev) {
      router.push(prev)
    } else {
      router.back()
    }
    setPreviousPath(stackRef.current[stackRef.current.length - 1] || null)
  }

  return (
    <NavigationContext.Provider value={{ previousPath, pushPath, goBack }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) throw new Error('useNavigation must be used within NavigationProvider')
  return context
}
