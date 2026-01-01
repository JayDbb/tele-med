import { NextRequest, NextResponse } from 'next/server'

export function requireDevAdmin(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return { ok: false, response: NextResponse.json({ error: 'Dev admin disabled in production' }, { status: 403 }) }
  }
  const tokenHeader = req.headers.get('x-dev-admin-token') || req.headers.get('authorization')?.replace('Bearer ', '')
  if (!process.env.DEV_ADMIN_TOKEN || tokenHeader !== process.env.DEV_ADMIN_TOKEN) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true }
}
