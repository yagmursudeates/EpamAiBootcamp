import { auth } from '@/lib/auth'
import db from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface DbNotification {
  id: string
  user_id: string
}

export async function PATCH(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const notif = db
      .prepare('SELECT id, user_id FROM notifications WHERE id = ?')
      .get(id) as DbNotification | undefined

    if (!notif) return Response.json({ error: 'Not found' }, { status: 404 })
    if (notif.user_id !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(
      id,
      session.user.id
    )

    return Response.json({ message: 'Marked as read' })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
