'use client'

import { useState, memo, lazy, Suspense } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import Sidebar from '@/components/Sidebar'
import SearchBar from '@/components/SearchBar'
import MobileBottomNav from '@/components/MobileBottomNav'
import OfflineIndicator from '@/components/OfflineIndicator'
import SyncStatus from '@/components/SyncStatus'
import DraggableWidget from '@/components/DraggableWidget'

// Lazy load heavy components for better performance
const Calendar = lazy(() => import('@/components/Calendar').then(m => ({ default: m.default })))
const Appointments = lazy(() => import('@/components/Appointments').then(m => ({ default: m.default })))
const AppointmentDetail = lazy(() => import('@/components/AppointmentDetail').then(m => ({ default: m.default })))
const ImportantUpdates = lazy(() => import('@/components/ImportantUpdates').then(m => ({ default: m.default })))

interface Widget {
  id: string
  component: React.ReactElement
  span?: number
}

interface WidgetLayout {
  grid: Widget[][]
  sidebar: Widget[]
}

// Component wrappers for lazy loading
const CalendarWidget = () => (
  <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48" />}>
    <Calendar />
  </Suspense>
)

const AppointmentsWidget = () => (
  <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48" />}>
    <Appointments />
  </Suspense>
)

const AppointmentDetailWidget = () => (
  <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48" />}>
    <AppointmentDetail />
  </Suspense>
)

const ImportantUpdatesWidget = () => (
  <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48" />}>
    <ImportantUpdates />
  </Suspense>
)

export default function Dashboard() {
  const [widgetLayout, setWidgetLayout] = useState<WidgetLayout>({
    grid: [
      [{ id: 'calendar', component: <CalendarWidget /> }, { id: 'appointments', component: <AppointmentsWidget /> }],
      [{ id: 'appointment-detail', component: <AppointmentDetailWidget />, span: 2 }],
    ],
    sidebar: [
      { id: 'important-updates', component: <ImportantUpdatesWidget /> }
    ]
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const saveLayoutToDatabase = async (layout: WidgetLayout) => {
    try {
      await fetch('/api/user/widget-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id', // Replace with actual user ID
          layout: {
            grid: layout.grid.map(row => 
              row.map(widget => ({ id: widget.id, span: widget.span ?? 1 }))
            ),
            sidebar: layout.sidebar.map(widget => ({ id: widget.id }))
          }
        })
      })
    } catch (error) {
      console.error('Failed to save layout:', error)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setWidgetLayout(prevLayout => {
      const newLayout = { ...prevLayout }
      
      // Find and remove the dragged widget
      let draggedWidget = null
      
      // Search in grid
      for (let rowIndex = 0; rowIndex < newLayout.grid.length; rowIndex++) {
        const widgetIndex = newLayout.grid[rowIndex].findIndex(w => w.id === active.id)
        if (widgetIndex !== -1) {
          draggedWidget = newLayout.grid[rowIndex][widgetIndex]
          newLayout.grid[rowIndex].splice(widgetIndex, 1)
          break
        }
      }
      
      // Search in sidebar if not found in grid
      if (!draggedWidget) {
        const sidebarIndex = newLayout.sidebar.findIndex(w => w.id === active.id)
        if (sidebarIndex !== -1) {
          draggedWidget = newLayout.sidebar[sidebarIndex]
          newLayout.sidebar.splice(sidebarIndex, 1)
        }
      }
      
      if (!draggedWidget) return prevLayout
      
      // Insert at new position
      // Find target position
      for (let rowIndex = 0; rowIndex < newLayout.grid.length; rowIndex++) {
        const targetIndex = newLayout.grid[rowIndex].findIndex(w => w.id === over.id)
        if (targetIndex !== -1) {
          newLayout.grid[rowIndex].splice(targetIndex, 0, draggedWidget)
          saveLayoutToDatabase(newLayout)
          return newLayout
        }
      }
      
      // Check sidebar
      const sidebarTargetIndex = newLayout.sidebar.findIndex(w => w.id === over.id)
      if (sidebarTargetIndex !== -1) {
        newLayout.sidebar.splice(sidebarTargetIndex, 0, draggedWidget)
        saveLayoutToDatabase(newLayout)
        return newLayout
      }
      
      return prevLayout
    })
  }

  const getAllWidgetIds = (): string[] => {
    const ids: string[] = []
    widgetLayout.grid.forEach(row => {
      row.forEach(widget => ids.push(widget.id))
    })
    widgetLayout.sidebar.forEach(widget => ids.push(widget.id))
    return ids
  }

  const mobileNavItems = [
    { icon: 'home', label: 'Home', href: '/doctor/dashboard' },
    { icon: 'groups', label: 'Patients', href: '/doctor/patients' },
    { icon: 'calendar_month', label: 'Calendar', href: '/doctor/calendar' },
    { icon: 'inbox', label: 'Inbox', href: '/doctor/inbox' },
  ]

  return (
    <div className="relative flex min-h-screen w-full">
      <OfflineIndicator />
      <Sidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-20 md:pb-8 grid grid-cols-12 gap-4 sm:gap-6 md:gap-8">
        <div className="col-span-12 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <SearchBar />
            <div className="hidden sm:block">
              <SyncStatus showDetails={false} />
            </div>
          </div>
          <div className="block sm:hidden mt-2">
            <SyncStatus showDetails={false} />
          </div>
        </div>
        
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={getAllWidgetIds()} strategy={rectSortingStrategy}>
            {/* Center Column */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 sm:gap-6 md:gap-8">
              {widgetLayout.grid.map((row, rowIndex) => (
                <div 
                  key={rowIndex} 
                  className={`grid gap-4 sm:gap-6 md:gap-8 ${
                    row.length === 1 
                      ? 'grid-cols-1' 
                      : 'grid-cols-1 sm:grid-cols-2'
                  }`}
                >
                  {row.map((widget) => (
                    <DraggableWidget key={widget.id} id={widget.id}>
                      <div className={widget.span === 2 ? 'col-span-1 sm:col-span-2' : ''}>
                        {widget.component}
                      </div>
                    </DraggableWidget>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Right Utility Panel */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 sm:gap-6 md:gap-8">
              {widgetLayout.sidebar.map((widget) => (
                <DraggableWidget key={widget.id} id={widget.id}>
                  {widget.component}
                </DraggableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav items={mobileNavItems} />
    </div>
  )
}