import { auth } from '@/lib/auth'
import { isBlindMode, setBlindMode } from '@/lib/settings'

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    return Response.json({ blindMode: isBlindMode() })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    const current = isBlindMode()
    setBlindMode(!current)
    return Response.json({ blindMode: !current })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
