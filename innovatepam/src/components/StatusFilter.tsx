'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

export default function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? ''

  const setFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map(({ value, label }) => (
        <Button
          key={value}
          size="sm"
          variant={current === value ? 'default' : 'outline'}
          onClick={() => setFilter(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
