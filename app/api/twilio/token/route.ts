import { NextRequest, NextResponse } from 'next/server'
import Twilio from 'twilio'

export async function GET(req: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const apiKey = process.env.TWILIO_API_KEY
    const apiSecret = process.env.TWILIO_API_SECRET

    if (!accountSid || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Twilio credentials are not configured' }, { status: 500 })
    }

    const url = new URL(req.url)
    const room = (url.searchParams.get('room') as string) || `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const identity = (url.searchParams.get('identity') as string) || `guest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const ttl = Number(url.searchParams.get('ttl') || '3600')

    const AccessToken = (Twilio as any).jwt.AccessToken
    const VideoGrant = AccessToken.VideoGrant

    const token = new AccessToken(accountSid, apiKey, apiSecret, { ttl })
    token.identity = identity
    token.addGrant(new VideoGrant({ room }))

    const jwt = token.toJwt()

    return NextResponse.json({ token: jwt, room, identity })
  } catch (err: any) {
    console.error('Error generating Twilio token:', err)
    return NextResponse.json({ error: err?.message || 'Failed to generate token' }, { status: 500 })
  }
}