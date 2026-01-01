'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import Sidebar from '@/components/Sidebar'
import SearchBar from '@/components/SearchBar'
import Calendar from '@/components/Calendar'
import Appointments from '@/components/Appointments'
import AppointmentDetail from '@/components/AppointmentDetail'
import ImportantUpdates from '@/components/ImportantUpdates'
import DraggableWidget from '@/components/DraggableWidget'

interface Widget {
  id: string
  component: React.ReactElement
  span?: number
}

interface WidgetLayout {
  grid: Widget[][]
  sidebar: Widget[]
}

export default function Dashboard() {
  const [widgetLayout, setWidgetLayout] = useState<WidgetLayout>({
    grid: [
      [{ id: 'calendar', component: <Calendar /> }, { id: 'appointments', component: <Appointments /> }],
      [{ id: 'appointment-detail', component: <AppointmentDetail />, span: 2 }],
    ],
    sidebar: [
      { id: 'important-updates', component: <ImportantUpdates /> }
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

  function handleDragEnd(event: any) {
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
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      
      <main className="flex-1 p-8 grid grid-cols-12 gap-8">
        <SearchBar />
        
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={getAllWidgetIds()} strategy={rectSortingStrategy}>
            {/* Center Column */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
              {widgetLayout.grid.map((row, rowIndex) => (
                // Use single-column on small screens and switch to two columns at md
                <div key={rowIndex} className={`grid gap-8 ${row.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {row.map((widget) => (
                    <DraggableWidget key={widget.id} id={widget.id}>
                      <div className={widget.span === 2 ? 'col-span-2' : ''}>
                        {widget.component}
                      </div>
                    </DraggableWidget>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Right Utility Panel */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
              {widgetLayout.sidebar.map((widget) => (
                <DraggableWidget key={widget.id} id={widget.id}>
                  {widget.component}
                </DraggableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>
    </div>
  )
}