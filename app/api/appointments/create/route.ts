import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const appointmentData = await request.json()
    
    const event = {
      summary: `${appointmentData.patientName} - ${appointmentData.type}`,
      description: appointmentData.notes || '',
      start: {
        dateTime: appointmentData.startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: appointmentData.endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: appointmentData.location || ''
    }
    
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Google Calendar API error:', errorData)
      return NextResponse.json(
        { success: false, error: errorData.error?.message || 'Failed to create appointment' },
        { status: response.status }
      )
    }
    
    const createdEvent = await response.json()
    
    return NextResponse.json({
      success: true,
      event: createdEvent
    })
    
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}