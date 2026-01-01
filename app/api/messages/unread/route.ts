import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const supabase = supabaseServer()
  const { count, error: err } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('recipient_id', userId).eq('read', false)
  if (err) return NextResponse.json({ error: err.message }, { status: 400 })
  return NextResponse.json({ unread: count || 0 })
}