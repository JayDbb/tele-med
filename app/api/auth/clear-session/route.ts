import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  // Clear cookie
  res.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' })
  return res
}
