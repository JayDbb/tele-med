import { NextRequest, NextResponse } from 'next/server'
import { requireDevAdmin } from '../_helpers'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const check = requireDevAdmin(req)
  if (!check.ok) return check.response

  try {
    const body = await req.json().catch(() => ({}))
    const { patient_id, name, dosage = null, frequency = null, start_date = null, end_date = null } = body
    if (!patient_id || !name) return NextResponse.json({ error: 'Missing patient_id or name' }, { status: 400 })

    const supabase = supabaseServer()
    const { data, error } = await supabase.from('medications').insert({ patient_id, prescriber_id: null, name, dosage, frequency, start_date, end_date }).select().maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ medication: data })
  } catch (err: any) {
    console.error('dev-admin/medications POST error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const check = requireDevAdmin(req)
  if (!check.ok) return check.response

  try {
    const url = new URL(req.url)
    const patientId = url.searchParams.get('patient_id')
    const supabase = supabaseServer()
    let query = supabase.from('medications').select('*').order('created_at', { ascending: false })
    if (patientId) query = query.eq('patient_id', patientId)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ medications: data })
  } catch (err: any) {
    console.error('dev-admin/medications GET error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
