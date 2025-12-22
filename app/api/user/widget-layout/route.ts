import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, layout } = await request.json()
    
    // In a real app, save to your database
    // Example with Prisma:
    // await prisma.userWidgetLayout.upsert({
    //   where: { userId },
    //   update: { layout },
    //   create: { userId, layout }
    // })
    
    // For now, just log the layout matrix
    console.log('Saving widget layout for user:', userId)
    console.log('Layout matrix:', JSON.stringify(layout, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save layout' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    
    // In a real app, fetch from your database
    // const userLayout = await prisma.userWidgetLayout.findUnique({
    //   where: { userId }
    // })
    
    // Return default layout for now
    const defaultLayout = {
      grid: [
        [{ id: 'calendar' }, { id: 'appointments' }],
        [{ id: 'appointment-detail', span: 2 }]
      ],
      sidebar: [
        { id: 'important-updates' }
      ]
    }
    
    return NextResponse.json({ layout: defaultLayout })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load layout' }, { status: 500 })
  }
}