import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/google-calendar/callback`
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly')}&` +
      `access_type=offline&` +
      `prompt=consent`

    return NextResponse.json({ authUrl })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}