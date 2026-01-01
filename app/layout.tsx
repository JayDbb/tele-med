import type { Metadata } from 'next'
import './globals.css'
import ClientThemeWrapper from '../components/ClientThemeWrapper'
import AuthProvider from '../components/AuthProvider'
import { AppointmentsProvider } from '../contexts/AppointmentsContext'
import { VideoCallProvider } from '../contexts/VideoCallContext'
import { DoctorProvider } from '../contexts/DoctorContext'
import { NurseProvider } from '../contexts/NurseContext'
import VideoCallWrapper from '../components/VideoCallWrapper'
import AuthWrapper from '../components/AuthWrapper'
import { NavigationProvider } from '../contexts/NavigationContext'

export const metadata: Metadata = {
  title: 'Medical Dashboard',
  description: 'Medical Dashboard for Doctors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-display bg-background-light dark:bg-background-dark">
        <DoctorProvider>
          <NurseProvider>
            <AuthProvider>
              <AppointmentsProvider>
                <VideoCallProvider>
                  <ClientThemeWrapper>
                    <AuthWrapper>
                      {/* NavigationProvider wraps children so pages can use useNavigation for back handling */}
                      <NavigationProvider>
                        {children}
                      </NavigationProvider>
                    </AuthWrapper>
                    <VideoCallWrapper />
                  </ClientThemeWrapper>
                </VideoCallProvider>
              </AppointmentsProvider>
            </AuthProvider>
          </NurseProvider>
        </DoctorProvider>
      </body>
    </html>
  )
}