'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface DeleteIdeaButtonProps {
  ideaId: string
  redirectTo?: string
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export default function DeleteIdeaButton({
  ideaId,
  redirectTo = '/dashboard',
  variant = 'destructive',
  size = 'sm',
  className,
}: DeleteIdeaButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true)
      // Auto-reset confirm state after 3 seconds if not clicked again
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    handleDelete()
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/ideas/${ideaId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(typeof err.error === 'string' ? err.error : 'Failed to delete')
        return
      }
      toast.success('Idea deleted')
      router.push(redirectTo)
      router.refresh()
    } finally {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={deleting}
      onClick={handleClick}
    >
      {deleting ? 'Deleting…' : confirming ? 'Confirm delete?' : 'Delete'}
    </Button>
  )
}
