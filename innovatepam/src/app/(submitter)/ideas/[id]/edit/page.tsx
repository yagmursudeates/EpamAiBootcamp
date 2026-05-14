import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import IdeaForm from '@/components/IdeaForm'
import type { DbIdea } from '@/types/db'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditDraftPage({ params }: PageProps) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params

  const idea = db
    .prepare('SELECT * FROM ideas WHERE id = ? AND submitter_id = ?')
    .get(id, session.user.id) as DbIdea | undefined

  if (!idea) notFound()
  if (idea.status !== 'draft') redirect(`/ideas/${id}`)

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Draft</h1>
      <IdeaForm draft={idea} />
    </div>
  )
}
