import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'

// GET: list medications for a patient
export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const url = new URL(req.url)
  const patientId = url.searchParams.get('patient_id')
  if (!patientId) return NextResponse.json({ error: 'Missing patient_id' }, { status: 400 })

  const supabase = supabaseServer()
  const { data, error: dbError } = await supabase.from('medications').select('*').eq('patient_id', patientId).order('created_at', { ascending: false })
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ medications: data })
}

// POST: add medication for a patient
export async function POST(req: NextRequest) {
  const { userId, user, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const body = await req.json()
  const { patient_id, name, dosage = null, frequency = null, start_date = null, end_date = null } = body
  if (!patient_id || !name) return NextResponse.json({ error: 'Missing patient_id or name' }, { status: 400 })

  const supabase = supabaseServer()

  // Defensive: ensure canonical public.users row exists for the prescriber to satisfy FK constraints
  try {
    await supabase.from('users').upsert({ id: userId, email: user?.email ?? null, name: user?.user_metadata?.full_name ?? null, role: user?.user_metadata?.role ?? null }).select().maybeSingle()
  } catch (e) {
    console.error('Failed to upsert user profile before medication insert:', e)
  }

  const { data, error: dbError } = await supabase.from('medications').insert({ patient_id, prescriber_id: userId, name, dosage, frequency, start_date, end_date }).select().maybeSingle()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })

  return NextResponse.json({ medication: data })
}