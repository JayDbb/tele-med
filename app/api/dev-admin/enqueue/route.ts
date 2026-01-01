import { NextRequest, NextResponse } from 'next/server'
import { requireDevAdmin } from '../_helpers'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const check = requireDevAdmin(req)
  if (!check.ok) return check.response

  try {
    const { visit_id, cache_id, path } = await req.json()
    if (!visit_id) return NextResponse.json({ error: 'Missing visit_id' }, { status: 400 })

    const supabase = supabaseServer()
    let usePath = path

    if (!usePath && cache_id) {
      const { data: cacheRow, error: getErr } = await supabase.rpc('get_cache_entry', { _cache_id: cache_id })
      if (getErr || !cacheRow || !cacheRow[0]) return NextResponse.json({ error: 'Cache entry not found' }, { status: 400 })
      usePath = cacheRow[0].path
    }

    if (!usePath) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

    const { data: jobData, error: jobErr } = await supabase.rpc('enqueue_transcription_job', { _visit_id: visit_id, _path: usePath, _cache_id: cache_id ?? null })
    if (jobErr) return NextResponse.json({ error: jobErr.message }, { status: 500 })

    const job = Array.isArray(jobData) ? jobData[0] : jobData
    return NextResponse.json({ job })
  } catch (err: any) {
    console.error('dev-admin/enqueue error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
