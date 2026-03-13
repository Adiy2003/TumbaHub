import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/auth/login')
  }

  return <>{children}</>
}
