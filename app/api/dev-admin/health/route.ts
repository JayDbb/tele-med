import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ ok: false }, { status: 403 })
  return NextResponse.json({ ok: true, env: process.env.NODE_ENV || 'development' })
}
