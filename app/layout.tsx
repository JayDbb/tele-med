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
import SyncManager from '../components/SyncManager'
import PwaManager from '../components/PwaManager'

export const metadata: Metadata = {
  title: 'Intellibus Tele-Medicine',
  description: 'Intellibus Tele-Medicine portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark icons-ready">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var root = document.documentElement;
                root.classList.add('icons-loading');
                if (document.fonts && document.fonts.load) {
                  document.fonts.load('24px \"Material Symbols Outlined\"').then(function () {
                    root.classList.add('icons-ready');
                  }).catch(function () {
                    root.classList.add('icons-ready');
                  });
                } else {
                  root.classList.add('icons-ready');
                }
              })();
            `
          }}
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
                      {children}
                    </AuthWrapper>
                    <VideoCallWrapper />
                    <SyncManager />
                    <PwaManager />
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
