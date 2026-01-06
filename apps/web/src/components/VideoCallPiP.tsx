'use client'

import { useState, useRef, useEffect } from 'react'

interface VideoCallPiPProps {
  isOpen: boolean
  onClose: () => void
  patientName: string
  patientEmail: string
}

export default function VideoCallPiP({ isOpen, onClose, patientName, patientEmail }: VideoCallPiPProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [size, setSize] = useState({ width: 320, height: 240 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState('')
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 })
  const videoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      if (isDragging && videoRef.current) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        })
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        
        if (isResizing === 'se') {
          setSize({ 
            width: Math.max(200, resizeStart.width + deltaX),
            height: Math.max(150, resizeStart.height + deltaY)
          })
        } else if (isResizing === 'e') {
          setSize({ 
            width: Math.max(200, resizeStart.width + deltaX),
            height: resizeStart.height
          })
        } else if (isResizing === 's') {
          setSize({ 
            width: resizeStart.width,
            height: Math.max(150, resizeStart.height + deltaY)
          })
        } else if (isResizing === 'w') {
          const newWidth = Math.max(200, resizeStart.width - deltaX)
          setSize({ width: newWidth, height: resizeStart.height })
          setPosition({ x: resizeStart.posX + (resizeStart.width - newWidth), y: position.y })
        } else if (isResizing === 'n') {
          const newHeight = Math.max(150, resizeStart.height - deltaY)
          setSize({ width: resizeStart.width, height: newHeight })
          setPosition({ x: position.x, y: resizeStart.posY + (resizeStart.height - newHeight) })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing('')
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isDragging, isResizing, dragOffset, resizeStart])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    if (videoRef.current) {
      const rect = videoRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  const handleResizeStart = (direction: string) => (e: React.MouseEvent) => {
    e.stopPropagation()
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y
    })
    setIsResizing(direction)
  }

  if (!isOpen) return null

  const getVideoSize = () => {
    if (isExpanded) return { width: window.innerWidth, height: window.innerHeight }
    if (isMinimized) return { width: 64, height: 64 }
    return size
  }

  const getVideoPosition = () => {
    if (isExpanded) return { x: 0, y: 0 }
    return position
  }

  const currentSize = getVideoSize()
  const currentPosition = getVideoPosition()

  return (
    <div
      ref={videoRef}
      className={`fixed z-[9999] bg-gray-900 shadow-2xl border border-gray-700 overflow-hidden transition-all duration-300 ${
        isExpanded ? 'rounded-none' : 'rounded-lg'
      }`}
      style={{ 
        left: currentPosition.x, 
        top: currentPosition.y,
        width: currentSize.width,
        height: currentSize.height
      }}
    >
      {/* Header */}
      <div
        className={`bg-gray-800 px-3 py-2 flex items-center justify-between cursor-move select-none ${isMinimized ? 'hidden' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-white text-sm">drag_indicator</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-medium truncate">{patientName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsMinimized(true)
              setIsExpanded(false)
            }}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
            title="Minimize"
          >
            <span className="material-symbols-outlined text-sm">minimize</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
            title={isExpanded ? "Restore" : "Expand"}
          >
            <span className="material-symbols-outlined text-sm">
              {isExpanded ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400 p-1 rounded transition-colors"
            title="End Call"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>

      {/* Minimized State */}
      {isMinimized && (
        <div
          className="w-full h-full bg-green-500 flex items-center justify-center cursor-pointer"
          onClick={() => setIsMinimized(false)}
          title={`Video call with ${patientName}`}
        >
          <span className="material-symbols-outlined text-white text-lg">videocam</span>
        </div>
      )}

      {/* Video Content */}
      {!isMinimized && (
        <div 
          className="relative bg-black flex-1 flex items-center justify-center" 
          style={{ height: isExpanded ? currentSize.height - 40 : currentSize.height - 40 }}
        >
          {/* Simulated video feed */}
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
              <p className="text-sm font-medium">{patientName}</p>
              <p className="text-xs text-white/70">Connected</p>
            </div>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center gap-4">
              <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined">mic</span>
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined">videocam</span>
              </button>
              <button 
                onClick={onClose}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">call_end</span>
              </button>
            </div>
          </div>

          {/* Resize Handles */}
          {!isExpanded && (
            <>
              {/* Edge resize handles with larger hit areas */}
              <div className="absolute -top-1 left-0 right-0 h-2 cursor-n-resize" onMouseDown={handleResizeStart('n')} />
              <div className="absolute -bottom-1 left-0 right-0 h-2 cursor-s-resize" onMouseDown={handleResizeStart('s')} />
              <div className="absolute -left-1 top-0 bottom-0 w-2 cursor-w-resize" onMouseDown={handleResizeStart('w')} />
              <div className="absolute -right-1 top-0 bottom-0 w-2 cursor-e-resize" onMouseDown={handleResizeStart('e')} />
              {/* Corner handle */}
              <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-gray-600" onMouseDown={handleResizeStart('se')} />
            </>
          )}
          
          {/* Drag area - entire video content */}
          <div 
            className="absolute inset-2 cursor-move" 
            onMouseDown={!isExpanded ? handleMouseDown : undefined}
          />
        </div>
      )}
    </div>
  )
}