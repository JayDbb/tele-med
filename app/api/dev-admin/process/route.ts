import { NextRequest, NextResponse } from 'next/server'
import { requireDevAdmin } from '../_helpers'
import { supabaseServer } from '@/lib/supabaseServer'
import { processJob } from '@/lib/transcribeWorker'

export async function POST(req: NextRequest) {
  const check = requireDevAdmin(req)
  if (!check.ok) return check.response

  try {
    const { job_id, simulate } = await req.json()
    if (!job_id) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })

    const supabase = supabaseServer()
    const result = await processJob(job_id, { simulate: !!simulate, supabaseClient: supabase })

    return NextResponse.json({ result })
  } catch (err: any) {
    console.error('dev-admin/process error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
