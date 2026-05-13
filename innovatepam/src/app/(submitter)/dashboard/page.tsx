import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import IdeaCard from '@/components/IdeaCard'
import type { DbIdea, DbUser } from '@/types/db'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const ideas = db
    .prepare(
      `SELECT i.*, u.name as submitter_name FROM ideas i
       JOIN users u ON u.id = i.submitter_id
       WHERE i.submitter_id = ?
       ORDER BY i.created_at DESC`
    )
    .all(session.user.id) as (DbIdea & { submitter_name: string })[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Ideas</h1>
        <a
          href="/submit"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
        >
          + New Idea
        </a>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No ideas yet</p>
          <p className="text-sm">Submit your first idea to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} href={`/ideas/${idea.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
