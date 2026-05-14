import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import IdeaCard from '@/components/IdeaCard'
import StatusFilter from '@/components/StatusFilter'
import BlindModeToggle from '@/components/BlindModeToggle'
import { isBlindMode } from '@/lib/settings'
import { Suspense } from 'react'
import type { DbIdea } from '@/types/db'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminIdeasPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') redirect('/dashboard')

  const { status } = await searchParams
  const blindMode = isBlindMode()

  let ideas: (DbIdea & { submitter_name: string })[]

  if (status) {
    ideas = db
      .prepare(
        `SELECT i.*, u.name as submitter_name FROM ideas i
         JOIN users u ON u.id = i.submitter_id
         WHERE i.status = ? AND i.status != 'draft'
         ORDER BY i.created_at DESC`
      )
      .all(status) as (DbIdea & { submitter_name: string })[]
  } else {
    ideas = db
      .prepare(
        `SELECT i.*, u.name as submitter_name FROM ideas i
         JOIN users u ON u.id = i.submitter_id
         WHERE i.status != 'draft'
         ORDER BY i.created_at DESC`
      )
      .all() as (DbIdea & { submitter_name: string })[]
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Ideas</h1>
        <div className="flex items-center gap-4">
          <BlindModeToggle enabled={blindMode} />
          <span className="text-muted-foreground text-sm">{ideas.length} ideas</span>
        </div>
      </div>

      <div className="mb-6">
        <Suspense>
          <StatusFilter />
        </Suspense>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No ideas found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={{ ...idea, submitter_name: blindMode ? 'Anonymous' : idea.submitter_name }}
              href={`/admin/ideas/${idea.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
