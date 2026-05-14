'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface BlindModeToggleProps {
  enabled: boolean
}

export default function BlindModeToggle({ enabled }: BlindModeToggleProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useState(enabled)

  async function toggle() {
    setOptimistic((prev) => !prev)
    try {
      const res = await fetch('/api/admin/blind-mode', { method: 'POST' })
      if (!res.ok) {
        setOptimistic(enabled) // revert
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setOptimistic(enabled) // revert
    }
  }

  return (
    <Button
      variant={optimistic ? 'default' : 'outline'}
      size="sm"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={optimistic}
    >
      {optimistic ? '🔒 Blind Review: On' : '👁 Blind Review: Off'}
    </Button>
  )
}
