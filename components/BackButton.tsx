'use client'

import { useRouter } from 'next/navigation'
import { useNavigation } from '@/contexts/NavigationContext'

export default function BackButton({ children }: { children?: React.ReactNode }) {
  const router = useRouter()
  const { previousPath, goBack } = useNavigation()

  const handleClick = () => {
    if (previousPath) {
      goBack()
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
    >
      <span className="text-lg">←</span>
      {children ?? 'Back'}
    </button>
  )
}
