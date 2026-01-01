import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { processJob } from '@/lib/transcribeWorker'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const { userId, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  try {
    const { job_id, simulate = false } = await req.json()
    if (!job_id) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })

    const supabase = supabaseServer()
    // verify job exists and belongs to the visit the user can access — minimal check: job exists
    const { data: job, error: jobErr } = await supabase.from('transcription_jobs').select('*').eq('id', job_id).maybeSingle()
    if (jobErr || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // Process the job synchronously
    const result = await processJob(job_id, { simulate })

    return NextResponse.json({ result })
  } catch (e: any) {
    console.error('Error processing job:', e)
    return NextResponse.json({ error: e.message || 'Failed to process job' }, { status: 500 })
  }
}
