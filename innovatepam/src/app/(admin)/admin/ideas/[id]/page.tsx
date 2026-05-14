import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import EvaluationForm from '@/components/EvaluationForm'
import DeleteIdeaButton from '@/components/DeleteIdeaButton'
import { formatDate, formatDateTime } from '@/lib/utils'
import { FIELD_LABEL_MAP } from '@/lib/categoryFields'
import { isBlindMode } from '@/lib/settings'
import type { DbIdea, DbAttachment, DbEvaluation, DbStageHistory } from '@/types/db'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminIdeaDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/dashboard')

  const { id } = await params
  const blindMode = isBlindMode()

  const idea = db
    .prepare(
      `SELECT i.*, u.name as submitter_name FROM ideas i
       JOIN users u ON u.id = i.submitter_id
       WHERE i.id = ?`
    )
    .get(id) as (DbIdea & { submitter_name: string }) | undefined

  if (!idea) notFound()

  // Admins cannot access draft ideas
  if (idea.status === 'draft') {
    redirect('/admin/ideas')
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

  const stageHistory = db
    .prepare(
      `SELECT h.*, u.name as evaluator_name FROM review_stage_history h
       JOIN users u ON u.id = h.evaluator_id
       WHERE h.idea_id = ? ORDER BY h.created_at ASC`
    )
    .all(id) as (DbStageHistory & { evaluator_name: string })[]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{idea.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {blindMode ? (
              <span className="italic">Submitted anonymously · {formatDate(idea.created_at)}</span>
            ) : (
              <>By {idea.submitter_name} · {formatDate(idea.created_at)}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={idea.status} />
          <DeleteIdeaButton ideaId={idea.id} redirectTo="/admin/ideas" />
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {evaluation ? 'Update Evaluation' : 'Evaluate Idea'}
          </CardTitle>
          {evaluation && (
            <p className="text-xs text-muted-foreground">
              Last updated by {evaluation.evaluator_name} on{' '}
              {formatDateTime(evaluation.updated_at)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <EvaluationForm
            ideaId={id}
            currentStatus={idea.status}
            currentNotes={evaluation?.notes ?? undefined}
          />
        </CardContent>
      </Card>

      {stageHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review History</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-border space-y-4 pl-4">
              {stageHistory.map((h) => (
                <li key={h.id} className="ml-2">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-background bg-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(h.created_at)} · {h.evaluator_name}
                  </p>
                  <p className="text-sm font-medium">
                    {h.from_status ?? '—'} → {h.to_status}
                  </p>
                  {h.notes && (
                    <p className="text-sm text-muted-foreground mt-0.5">{h.notes}</p>
                  )}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
