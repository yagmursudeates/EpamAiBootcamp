import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  submitted: {
    label: 'Submitted',
    icon: '📬',
    className: 'bg-slate-100 text-slate-700 border border-slate-200',
  },
  screening: {
    label: 'Screening',
    icon: '🔍',
    className: 'bg-violet-100 text-violet-700 border border-violet-200',
  },
  under_review: {
    label: 'Under Review',
    icon: '⚡',
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  accepted: {
    label: 'Accepted',
    icon: '✅',
    className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    icon: '❌',
    className: 'bg-red-100 text-red-700 border border-red-200',
  },
  draft: {
    label: 'Draft',
    icon: '📝',
    className: 'bg-gray-100 text-gray-500 border border-gray-200',
  },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, icon: '', className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
      config.className,
      className
    )}>
      <span className="text-[10px]">{config.icon}</span>
      {config.label}
    </span>
  )
}
