import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'

// GET: list files for owner or bucket
export async function GET(req: NextRequest) {
  const { userId, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const url = new URL(req.url)
  const bucket = url.searchParams.get('bucket')

  const supabase = supabaseServer()

  if (bucket) {
    const { data, error: dbError } = await supabase.from('files').select('*').eq('bucket', bucket).order('created_at', { ascending: false })
    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
    return NextResponse.json({ files: data })
  }

  const { data, error: dbError } = await supabase.from('files').select('*').eq('owner_id', userId).order('created_at', { ascending: false })
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })
  return NextResponse.json({ files: data })
}

// POST: insert a file metadata row (client uploads to storage separately)
export async function POST(req: NextRequest) {
  const { userId, user, error } = await requireUser(req)
  if (!userId) return NextResponse.json({ error }, { status: 401 })

  const { bucket, path, type = null, size = null, metadata = null } = await req.json()
  if (!bucket || !path) return NextResponse.json({ error: 'Missing bucket or path' }, { status: 400 })

  const supabase = supabaseServer()

  // Defensive: ensure canonical public.users row exists for the owner to satisfy FK constraints
  try {
    await supabase.from('users').upsert({ id: userId, email: user?.email ?? null, name: user?.user_metadata?.full_name ?? null, role: user?.user_metadata?.role ?? null }).select().maybeSingle()
  } catch (e) {
    console.error('Failed to upsert user profile before file insert:', e)
  }

  const { data, error: dbError } = await supabase.from('files').insert({ bucket, path, owner_id: userId, type, size, metadata }).select().maybeSingle()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 })

  return NextResponse.json({ file: data })
}