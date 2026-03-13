import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import Header from '@/components/Header'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'TumbaHub - TumbaCoin Currency',
  description: 'Track and manage your TumbaCoins with friends',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-900 text-white antialiased">
        <AuthProvider>
          <Header />
          <main className="pt-16 pb-20">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}
