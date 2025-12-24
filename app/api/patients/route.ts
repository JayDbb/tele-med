import { NextRequest, NextResponse } from 'next/server'

// Mock database - replace with actual database
let patients: any[] = [
  {
    id: 'P001',
    name: 'Amanda Kimber',
    email: 'amanda.kimber@email.com',
    dob: '1985-03-15',
    phone: '+1 (555) 123-4567',
    createdAt: new Date().toISOString()
  },
  {
    id: 'P002', 
    name: 'John Smith',
    email: 'john.smith@email.com',
    dob: '1978-07-22',
    phone: '+1 (555) 987-6543',
    createdAt: new Date().toISOString()
  }
]

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