import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { EvaluationSchema } from '@/lib/validations'
import { buildNotificationMessage } from '@/lib/notifications'
import { sendEvaluationEmail } from '@/lib/mailer'
import type { DbIdea, DbEvaluation, DbUser } from '@/types/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: ideaId } = await params

    const idea = db
      .prepare('SELECT * FROM ideas WHERE id = ?')
      .get(ideaId) as DbIdea | undefined

    if (!idea) return Response.json({ error: 'Idea not found' }, { status: 404 })
    if (idea.status === 'draft') {
      return Response.json({ error: 'Cannot evaluate a draft idea' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = EvaluationSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { decision, notes, scores } = parsed.data

    // Upsert evaluation + sync status + log history + create notification — all in one transaction
    const transact = db.transaction(() => {
      const existing = db
        .prepare('SELECT id FROM evaluations WHERE idea_id = ?')
        .get(ideaId) as DbEvaluation | undefined

      const scoresJson = scores ? JSON.stringify(scores) : null

      if (existing) {
        db.prepare(
          `UPDATE evaluations
           SET decision = ?, notes = ?, scores = ?, evaluator_id = ?, updated_at = datetime('now')
           WHERE idea_id = ?`
        ).run(decision, notes ?? null, scoresJson, session.user.id, ideaId)
      } else {
        db.prepare(
          `INSERT INTO evaluations (id, idea_id, evaluator_id, decision, notes, scores)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(uuidv4(), ideaId, session.user.id, decision, notes ?? null, scoresJson)
      }

      db.prepare(
        `UPDATE ideas SET status = ?, updated_at = datetime('now') WHERE id = ?`
      ).run(decision, ideaId)

      // Log stage transition history
      db.prepare(
        `INSERT INTO review_stage_history (id, idea_id, from_status, to_status, evaluator_id, notes)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(uuidv4(), ideaId, idea.status, decision, session.user.id, notes ?? null)

      const message = buildNotificationMessage(decision, idea.title)
      db.prepare(
        `INSERT INTO notifications (id, user_id, idea_id, message) VALUES (?, ?, ?, ?)`
      ).run(uuidv4(), idea.submitter_id, ideaId, message)
    })

    transact()

    // Send email notification — fire-and-forget (non-blocking)
    const submitter = db
      .prepare('SELECT email FROM users WHERE id = ?')
      .get(idea.submitter_id) as Pick<DbUser, 'email'> | undefined

    if (submitter) {
      const message = buildNotificationMessage(decision, idea.title)
      const humanDecision: Record<string, string> = {
        accepted: 'accepted',
        rejected: 'rejected',
        under_review: 'is now under review',
      }
      const subject = `[InnovatEPAM] Your idea '${idea.title}' was ${humanDecision[decision] ?? decision}`
      const body = `${message}\n\nView your idea: ${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/ideas/${ideaId}`
      sendEvaluationEmail(submitter.email, subject, body).catch(console.error)
    }

    return Response.json({ message: 'Evaluation saved' })
  } catch (err) {
    console.error('[evaluate] error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
