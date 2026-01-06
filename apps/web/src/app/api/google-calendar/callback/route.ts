import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  
  if (code) {
    // Store the authorization code (in production, exchange for access token)
    return new NextResponse(`
      <script>
        window.opener.postMessage({ success: true, code: '${code}' }, '*');
        window.close();
      </script>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
  
  return NextResponse.json({ error: 'No authorization code received' }, { status: 400 })
}