import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  submitted: {
    label: 'Submitted',
    className: 'bg-[#6B7280] text-white hover:bg-[#6B7280]',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-[#D97706] text-white hover:bg-[#D97706]',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-[#16A34A] text-white hover:bg-[#16A34A]',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-[#DC2626] text-white hover:bg-[#DC2626]',
  },
  draft: {
    label: 'Draft',
    className: 'bg-[#9CA3AF] text-white hover:bg-[#9CA3AF]',
  },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: '' }
  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
