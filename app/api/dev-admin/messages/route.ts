import { NextRequest, NextResponse } from 'next/server'
import { requireDevAdmin } from '../_helpers'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const check = requireDevAdmin(req)
  if (!check.ok) return check.response

  try {
    const body = await req.json().catch(() => ({}))
    const { sender_id, recipient_id, body: messageBody, attachments = null } = body
    if (!sender_id || !recipient_id || !messageBody) return NextResponse.json({ error: 'Missing sender_id, recipient_id or body' }, { status: 400 })

    const supabase = supabaseServer()
    const { data, error } = await supabase.from('messages').insert({ conversation_id: null, sender_id, recipient_id, body: messageBody, attachments }).select().maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: data })
  } catch (err: any) {
    console.error('dev-admin/messages error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const check = requireDevAdmin(req)
  if (!check.ok) return check.response

  try {
    const url = new URL(req.url)
    const recipientId = url.searchParams.get('recipient_id')
    const supabase = supabaseServer()
    let query = supabase.from('messages').select('*').order('created_at', { ascending: false })
    if (recipientId) query = query.eq('recipient_id', recipientId)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ messages: data })
  } catch (err: any) {
    console.error('dev-admin/messages GET error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
