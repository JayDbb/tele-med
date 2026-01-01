import { NextRequest, NextResponse } from 'next/server'
import { requireDevAdmin } from '../_helpers'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const check = requireDevAdmin(req)
  if (!check.ok) return check.response

  const bucket = process.env.STORAGE_BUCKET
  if (!bucket) return NextResponse.json({ error: 'Missing STORAGE_BUCKET' }, { status: 500 })

  try {
    const { filename, contentType, size, metadata, ownerId } = await req.json()
    const ext = filename?.includes('.') ? filename.split('.').pop() : (contentType?.split('/').pop() || 'bin')
    const owner = ownerId ?? 'dev-admin'
    const objectPath = `recordings/dev-admin/${owner}/${Date.now()}-${crypto.randomUUID().slice(0,8)}.${ext}`

    const supabase = supabaseServer()
    const { data, error: signError } = await supabase.storage.from(bucket).createSignedUploadUrl(objectPath, { upsert: false })
    if (signError || !data) return NextResponse.json({ error: signError?.message || 'Failed to sign url' }, { status: 500 })

    const { data: c, error: rpcErr } = await supabase.rpc('create_cache_entry', { _path: objectPath, _owner: ownerId ?? null, _size: size ?? null, _metadata: metadata ?? {} })
    if (rpcErr || !c) return NextResponse.json({ error: rpcErr?.message || 'Failed to create cache entry' }, { status: 500 })

    const cache = Array.isArray(c) ? c[0] : c
    return NextResponse.json({ cache, path: objectPath, signedUrl: data.signedUrl, token: data.token, bucket })
  } catch (err: any) {
    console.error('dev-admin/create-cache error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
