import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'

const STATUS_ACCENT: Record<string, string> = {
  submitted: 'border-l-slate-400',
  screening: 'border-l-violet-400',
  under_review: 'border-l-amber-400',
  accepted: 'border-l-emerald-400',
  rejected: 'border-l-red-400',
  draft: 'border-l-gray-300',
}

interface IdeaCardProps {
  idea: {
    id: string
    title: string
    category: string
    status: string
    created_at: string
    submitter_name?: string
  }
  href: string
}

export default function IdeaCard({ idea, href }: IdeaCardProps) {
  const accent = STATUS_ACCENT[idea.status] ?? 'border-l-gray-300'
  return (
    <Link href={href}>
      <div className={`bg-white rounded-xl border border-border border-l-4 ${accent} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full`}>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-foreground">
              {idea.title}
            </h3>
            <StatusBadge status={idea.status} />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="bg-muted px-2 py-0.5 rounded-full font-medium">{idea.category}</span>
            <span>{formatDate(idea.created_at)}</span>
          </div>
          {idea.submitter_name && (
            <p className="text-xs text-muted-foreground">By {idea.submitter_name}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
