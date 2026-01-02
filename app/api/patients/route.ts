import { NextRequest, NextResponse } from 'next/server'

// In-memory placeholder; replace with actual database
let patients: any[] = []

export async function GET() {
  return NextResponse.json({ patients })
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, dob, phone } = await request.json()
    
    // Generate patient ID
    const patientId = `P${String(patients.length + 1).padStart(3, '0')}`
    
    const newPatient = {
      id: patientId,
      name,
      email,
      dob,
      phone,
      createdAt: new Date().toISOString()
    }
    
    patients.push(newPatient)
    
    return NextResponse.json({ 
      success: true, 
      patient: newPatient 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create patient' },
      { status: 500 }
    )
  }
}
