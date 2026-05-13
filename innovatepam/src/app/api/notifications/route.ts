import { auth } from '@/lib/auth'
import db from '@/lib/db'

interface DbNotification {
  id: string
  user_id: string
  idea_id: string
  message: string
  is_read: number
  created_at: string
  idea_title?: string
}

export async function GET() {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const notifications = db
      .prepare(
        `SELECT n.*, i.title as idea_title
         FROM notifications n
         JOIN ideas i ON i.id = n.idea_id
         WHERE n.user_id = ?
         ORDER BY n.created_at DESC`
      )
      .all(session.user.id) as DbNotification[]

    const unreadCount = (
      db
        .prepare('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0')
        .get(session.user.id) as { cnt: number }
    ).cnt

    return Response.json({ notifications, unreadCount })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const session = await auth()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(session.user.id)

    return Response.json({ message: 'All marked as read' })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
