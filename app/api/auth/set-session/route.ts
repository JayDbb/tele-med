import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

    // Validate token by fetching user
    const supabase = supabaseServer()
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) {
      return NextResponse.json({ error: error?.message || 'Invalid token' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })

    // Set cookie; in development allow non-secure for localhost
    const isProd = process.env.NODE_ENV === 'production'
    res.cookies.set('sb-access-token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      // Expires not set; use session cookie to match Supabase session lifetime
    })

    return res
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to set session' }, { status: 500 })
  }
}
