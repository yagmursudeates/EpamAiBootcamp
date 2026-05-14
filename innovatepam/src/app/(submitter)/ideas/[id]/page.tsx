import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import DeleteIdeaButton from '@/components/DeleteIdeaButton'
import { formatDate, formatDateTime } from '@/lib/utils'
import { FIELD_LABEL_MAP } from '@/lib/categoryFields'
import type { DbIdea, DbAttachment, DbEvaluation, DbUser } from '@/types/db'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function IdeaDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params

  const idea = db
    .prepare(
      `SELECT i.*, u.name as submitter_name FROM ideas i
       JOIN users u ON u.id = i.submitter_id
       WHERE i.id = ?`
    )
    .get(id) as (DbIdea & { submitter_name: string }) | undefined

  if (!idea) notFound()

  // Submitters can only view their own ideas
  if (idea.submitter_id !== session.user.id) {
    redirect('/dashboard')
  }

  const attachments = db
    .prepare('SELECT * FROM attachments WHERE idea_id = ?')
    .all(id) as DbAttachment[]

  const evaluation = db
    .prepare(
      `SELECT e.*, u.name as evaluator_name FROM evaluations e
       JOIN users u ON u.id = e.evaluator_id
       WHERE e.idea_id = ?`
    )
    .get(id) as (DbEvaluation & { evaluator_name: string }) | undefined

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold">{idea.title}</h1>
        <div className="flex items-center gap-2">
          <StatusBadge status={idea.status} />
          <DeleteIdeaButton ideaId={idea.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Category: </span>
            {idea.category}
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Submitted: </span>
            {formatDate(idea.created_at)}
          </div>
          {idea.is_anonymous ? (
            <div className="inline-flex items-center gap-1.5 text-xs bg-muted rounded-full px-2.5 py-0.5 text-muted-foreground">
              🔒 Submitted anonymously
            </div>
          ) : null}
          <div>
            <span className="font-medium text-muted-foreground">Description</span>
            <p className="mt-1 whitespace-pre-wrap">{idea.description}</p>
          </div>
          {idea.category_metadata && (() => {
            const meta = JSON.parse(idea.category_metadata) as Record<string, string>
            const entries = Object.entries(meta).filter(([, v]) => v)
            return entries.length > 0 ? (
              <div>
                <span className="font-medium text-muted-foreground">Category Details</span>
                <dl className="mt-1 space-y-1">
                  {entries.map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <dt className="text-muted-foreground shrink-0">{FIELD_LABEL_MAP[key] ?? key}:</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null
          })()}
        </CardContent>
      </Card>

      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {attachments.map((att) => (
              <div key={att.id}>
                <a
                  href={`/api/attachments/${att.id}/download`}
                  className="text-sm text-blue-600 underline"
                >
                  {att.filename}
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {evaluation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evaluation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Decision: </span>
              <StatusBadge status={evaluation.decision} />
            </div>
            {evaluation.notes && (
              <div>
                <span className="font-medium text-muted-foreground">Notes: </span>
                <p className="mt-1 whitespace-pre-wrap">{evaluation.notes}</p>
              </div>
            )}
            <div className="text-muted-foreground">
              Evaluated by {evaluation.evaluator_name} on{' '}
              {formatDateTime(evaluation.updated_at)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
