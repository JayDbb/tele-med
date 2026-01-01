import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return new NextResponse('Unauthorized', { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const supabase = supabaseServer()

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) return new NextResponse('Unauthorized', { status: 401 })

    const user = userData.user

    // Upsert into public.users for profile fields
    const profile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || null,
      role: user.user_metadata?.role || null,
      avatar_url: user.user_metadata?.avatar || null,
      metadata: user.user_metadata || {},
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(profile)
      .select()

    if (error) {
      console.error('Error upserting profile:', error)
      return new NextResponse('Failed to upsert profile', { status: 500 })
    }

    return NextResponse.json({ user: data?.[0] ?? profile })
  } catch (err) {
    console.error('Error in /api/user GET:', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return new NextResponse('Unauthorized', { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const supabase = supabaseServer()

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) return new NextResponse('Unauthorized', { status: 401 })

    const body = await request.json()
    const { name, role, avatar_url, metadata } = body

    const profileUpdate = {
      id: userData.user.id,
      name: name ?? userData.user.user_metadata?.full_name ?? null,
      role: role ?? userData.user.user_metadata?.role ?? null,
      avatar_url: avatar_url ?? userData.user.user_metadata?.avatar ?? null,
      metadata: metadata ?? userData.user.user_metadata ?? {},
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(profileUpdate)
      .select()

    if (error) {
      console.error('Error updating profile:', error)
      return new NextResponse('Failed to update profile', { status: 500 })
    }

    return NextResponse.json({ user: data?.[0] ?? profileUpdate })
  } catch (err) {
    console.error('Error in /api/user POST:', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}
