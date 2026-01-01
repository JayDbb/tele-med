import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'

// GET: list appointments for clinician (or patient if query param patient_id)
export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const url = new URL(req.url)
  const patientId = url.searchParams.get('patient_id')

  const supabase = supabaseServer()
  if (patientId) {
    const { data, error: dbError } = await supabase.from('appointments').select('*').eq('patient_id', patientId).order('start_at', { ascending: false })
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
    return NextResponse.json({ appointments: data })
  }

  // Clinician's calendar: find clinician_id from public.users row
  const { data: userRow } = await supabase.from('users').select('id').eq('id', userId).maybeSingle()
  const { data, error: dbError } = await supabase.from('appointments').select('*').eq('clinician_id', userRow?.id || userId).order('start_at', { ascending: false })
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ appointments: data })
}

// POST: create appointment (DB + optional Google Calendar event creation handled by /appointments/create)
export async function POST(req: NextRequest) {
  const { userId, user, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const supabase = supabaseServer()
  const payload = await req.json()
  const { patient_id, start_at, end_at, status = 'scheduled', external_event_id = null, notes = null } = payload

  if (!patient_id || !start_at) return NextResponse.json({ error: 'Missing patient_id or start_at' }, { status: 400 })

  // Defensive: ensure canonical public.users row exists for the clinician to satisfy FK constraints
  try {
    await supabase.from('users').upsert({ id: userId, email: user?.email ?? null, name: user?.user_metadata?.full_name ?? null, role: user?.user_metadata?.role ?? null }).select().maybeSingle()
  } catch (e) {
    console.error('Failed to upsert user profile before appointment insert:', e)
  }

  const { data, error: dbError } = await supabase.from('appointments').insert({ patient_id, clinician_id: userId, start_at, end_at, status, external_event_id, created_at: new Date().toISOString() }).select().maybeSingle()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })

  return NextResponse.json({ appointment: data })
}

// PUT/DELETE could be implemented similarly as needed
