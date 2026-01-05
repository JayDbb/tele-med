import { NextResponse } from 'next/server';
import { requireUser } from '../../../../lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get('room');
  
  if (!room) {
    return NextResponse.json({ error: 'Room parameter is required' }, { status: 400 });
  }

  // Allow guest access for patient rooms (rooms starting with "patient-")
  // Other rooms require authentication
  const isPatientRoom = room.startsWith('patient-');
  
  let userId: string | null = null;
  let identity: string;
  
  if (isPatientRoom) {
    // Guest access for patient rooms - use a guest identity based on room name
    identity = `guest-${room}-${Date.now()}`;
  } else {
    // Require authentication for other rooms
    const nextReq: any = req as any;
    const authResult = await requireUser(nextReq);
    if (!authResult.userId) {
      return NextResponse.json({ error: authResult.error ?? 'Unauthorized' }, { status: 401 });
    }
    userId = authResult.userId;
    identity = userId;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;

  const missing: string[] = [];
  if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
  if (!apiKey) missing.push('TWILIO_API_KEY');
  if (!apiSecret) missing.push('TWILIO_API_SECRET');

  if (missing.length > 0) {
    console.error('Twilio env missing:', missing.join(', '));
    return NextResponse.json(
      { error: `Twilio credentials not configured: missing ${missing.join(', ')}. Add them to .env.local and restart the dev server.` },
      { status: 500 }
    );
  }

  try {
    const twilio = await import('twilio');
    const AccessToken = (twilio as any).jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(accountSid, apiKey, apiSecret, { identity });
    token.addGrant(new VideoGrant({ room }));
    const jwt = token.toJwt();
    return NextResponse.json({ token: jwt, room });
  } catch (e: any) {
    console.error('Twilio token generation error', e);
    return NextResponse.json({ error: e?.message ?? 'Token generation failed' }, { status: 500 });
  }
}
