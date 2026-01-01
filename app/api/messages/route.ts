import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'

// GET: list messages for the current user
export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const supabase = supabaseServer()
  const { data, error: dbError } = await supabase.from('messages').select('*').or(`sender_id.eq.${userId},recipient_id.eq.${userId}`).order('created_at', { ascending: false })
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ messages: data })
}

// POST: send a message
export async function POST(req: NextRequest) {
  const { userId, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const supabase = supabaseServer()
  const body = await req.json()
  const { recipient_id, body: messageBody, attachments = null } = body
  if (!recipient_id || !messageBody) return NextResponse.json({ error: 'Missing recipient_id or body' }, { status: 400 })

  const { data, error: dbError } = await supabase.from('messages').insert({ conversation_id: null, sender_id: userId, recipient_id, body: messageBody, attachments }).select().maybeSingle()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })

  return NextResponse.json({ message: data })
}
