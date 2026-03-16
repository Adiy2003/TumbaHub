import { handlers } from '@/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const { GET, POST } = handlers
