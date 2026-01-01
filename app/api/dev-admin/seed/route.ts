import { NextRequest, NextResponse } from 'next/server'
import { requireDevAdmin } from '../_helpers'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const check = requireDevAdmin(req)
  if (!check.ok) return check.response

  try {
    const body = await req.json().catch(() => ({}))
    const name = body.name || 'E2E Test Patient'
    const visitNote = body.visitNote || null

    const supabase = supabaseServer()

    const { data: patient, error: pErr } = await supabase.from('patients').insert({ full_name: name }).select().maybeSingle()
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

    const { data: visit, error: vErr } = await supabase.from('visits').insert({ patient_id: patient.id }).select().maybeSingle()
    if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 })

    // optional seed note
    if (visitNote) {
      await supabase.from('visit_notes').insert({ visit_id: visit.id, author_id: null, section: 'note', content: visitNote, source: 'dev-admin' })
    }

    return NextResponse.json({ patient, visit })
  } catch (err: any) {
    console.error('dev-admin/seed error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
