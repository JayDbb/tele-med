import { NextRequest, NextResponse } from 'next/server'

// In-memory placeholder; replace with actual database/service
let appointments: any[] = []

export async function GET() {
  return NextResponse.json({ appointments })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const nowIso = new Date().toISOString()

    const appointment = {
      id: payload.id || `appt-${appointments.length + 1}`,
      createdAt: payload.createdAt || nowIso,
      updatedAt: payload.updatedAt || nowIso,
      ...payload
    }

    appointments.push(appointment)

    return NextResponse.json({
      success: true,
      appointment
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
