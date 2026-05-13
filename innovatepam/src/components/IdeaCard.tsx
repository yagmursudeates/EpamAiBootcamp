import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'

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
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-[var(--radius-card)]">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold leading-snug line-clamp-2">
              {idea.title}
            </CardTitle>
            <StatusBadge status={idea.status} />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground flex items-center justify-between">
          <span>{idea.category}</span>
          <span>{formatDate(idea.created_at)}</span>
        </CardContent>
        {idea.submitter_name && (
          <CardContent className="pt-0 text-sm text-muted-foreground">
            By {idea.submitter_name}
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
