import { useRef, useCallback } from 'react'

interface SwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number // Minimum distance in pixels to trigger swipe
  velocityThreshold?: number // Minimum velocity to trigger swipe
}

export function useSwipeGesture(options: SwipeOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocityThreshold = 0.3
  } = options

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    touchEndRef.current = null
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) return

    const { x: startX, y: startY, time: startTime } = touchStartRef.current
    const { x: endX, y: endY, time: endTime } = touchEndRef.current

    const deltaX = endX - startX
    const deltaY = endY - startY
    const deltaTime = endTime - startTime
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / deltaTime

    // Check if swipe meets threshold requirements
    if (distance < threshold || velocity < velocityThreshold) {
      return
    }

    // Determine primary direction
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.()
      } else {
        onSwipeUp?.()
      }
    }

    // Reset
    touchStartRef.current = null
    touchEndRef.current = null
  }, [threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }
}

