import { NextRequest, NextResponse } from 'next/server'
import { requireDevAdmin } from '../_helpers'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const check = requireDevAdmin(req)
  if (!check.ok) return check.response

  try {
    const { patient_id, visit_id, job_id, cache_id } = await req.json()
    const supabase = supabaseServer()
    const results: any = {}

    if (job_id) results.job = (await supabase.from('transcription_jobs').delete().eq('id', job_id)).error?.message || null
    if (cache_id) results.cache = (await supabase.from('recording_cache').delete().eq('id', cache_id)).error?.message || null
    if (visit_id) results.visit = (await supabase.from('visits').delete().eq('id', visit_id)).error?.message || null
    if (patient_id) results.patient = (await supabase.from('patients').delete().eq('id', patient_id)).error?.message || null

    return NextResponse.json({ results })
  } catch (err: any) {
    console.error('dev-admin/cleanup error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
