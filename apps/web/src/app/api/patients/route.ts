import { NextRequest, NextResponse } from 'next/server'
import type { Patient } from '@/lib/types'

// Mock database - replace with actual database
let patients: Patient[] = [
  {
    id: 'P001',
    full_name: 'Amanda Kimber',
    email: 'amanda.kimber@email.com',
    dob: '1985-03-15',
    phone: '+1 (555) 123-4567',
    address: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'P002', 
    full_name: 'John Smith',
    email: 'john.smith@email.com',
    dob: '1978-07-22',
    phone: '+1 (555) 987-6543',
    address: null,
    created_at: new Date().toISOString()
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
    
    const newPatient: Patient = {
      id: patientId,
      full_name: name,
      email,
      dob,
      phone,
      address: null,
      created_at: new Date().toISOString()
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