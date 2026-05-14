import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import IdeaCard from '@/components/IdeaCard'
import DeleteIdeaButton from '@/components/DeleteIdeaButton'
import type { DbIdea } from '@/types/db'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const allIdeas = db
    .prepare(
      `SELECT i.*, u.name as submitter_name FROM ideas i
       JOIN users u ON u.id = i.submitter_id
       WHERE i.submitter_id = ?
       ORDER BY i.created_at DESC`
    )
    .all(session.user.id) as (DbIdea & { submitter_name: string })[]

  const drafts = allIdeas.filter((i) => i.status === 'draft')
  const submitted = allIdeas.filter((i) => i.status !== 'draft')

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Ideas</h1>
        <a
          href="/submit"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
        >
          + New Idea
        </a>
      </div>

      {/* Drafts section */}
      {drafts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">My Drafts</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((idea) => (
              <div key={idea.id} className="relative">
                <IdeaCard idea={{ ...idea, submitter_name: undefined }} href={`/ideas/${idea.id}/edit`} />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <a
                    href={`/ideas/${idea.id}/edit`}
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent h-7 px-2"
                  >
                    Edit
                  </a>
                  <DeleteIdeaButton ideaId={idea.id} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Submitted ideas section */}
      <section>
        {drafts.length > 0 && (
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Submitted Ideas</h2>
        )}
        {submitted.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">No ideas yet</p>
            <p className="text-sm">Submit your first idea to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {submitted.map((idea) => (
              <div key={idea.id} className="relative">
                <IdeaCard idea={{ ...idea, submitter_name: undefined }} href={`/ideas/${idea.id}`} />
                <div className="absolute bottom-4 right-4">
                  <DeleteIdeaButton ideaId={idea.id} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
