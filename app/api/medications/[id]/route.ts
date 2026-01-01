import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const supabase = supabaseServer()
  const id = params.id
  const { data, error: dbError } = await supabase.from('medications').select('*').eq('id', id).maybeSingle()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ medication: data })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const id = params.id
  const body = await req.json()
  const supabase = supabaseServer()

  const { data, error: dbError } = await supabase.from('medications').update(body).eq('id', id).select().maybeSingle()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ medication: data })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const id = params.id
  const supabase = supabaseServer()
  const { error: dbError } = await supabase.from('medications').delete().eq('id', id)
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ deleted: true })
}
