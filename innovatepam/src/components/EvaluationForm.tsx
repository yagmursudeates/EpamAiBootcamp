'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { EvaluationInput } from '@/lib/validations'

// Available stage transitions from each status
const TRANSITIONS: Record<string, { value: EvaluationInput['decision']; label: string; variant: 'default' | 'outline' | 'destructive' }[]> = {
  submitted: [
    { value: 'screening',    label: 'Move to Screening',    variant: 'outline' },
    { value: 'under_review', label: 'Move to Under Review', variant: 'outline' },
    { value: 'accepted',     label: 'Accept',               variant: 'default' },
    { value: 'rejected',     label: 'Reject',               variant: 'destructive' },
  ],
  screening: [
    { value: 'under_review', label: 'Move to Under Review', variant: 'outline' },
    { value: 'accepted',     label: 'Accept',               variant: 'default' },
    { value: 'rejected',     label: 'Reject',               variant: 'destructive' },
  ],
  under_review: [
    { value: 'accepted', label: 'Accept', variant: 'default' },
    { value: 'rejected', label: 'Reject', variant: 'destructive' },
  ],
  // terminal stages still allow re-evaluation
  accepted: [
    { value: 'under_review', label: 'Reopen Review',       variant: 'outline' },
    { value: 'rejected',     label: 'Reject',              variant: 'destructive' },
  ],
  rejected: [
    { value: 'under_review', label: 'Reopen Review',       variant: 'outline' },
    { value: 'accepted',     label: 'Accept',              variant: 'default' },
  ],
}

interface EvaluationFormProps {
  ideaId: string
  currentStatus: string
  currentNotes?: string
}

export default function EvaluationForm({
  ideaId,
  currentStatus,
  currentNotes,
}: EvaluationFormProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(currentNotes ?? '')
  const [submitting, setSubmitting] = useState(false)

  const transitions = TRANSITIONS[currentStatus] ?? TRANSITIONS['submitted']

  const handleEvaluate = async (decision: EvaluationInput['decision']) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/ideas/${ideaId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes: notes || undefined }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(typeof err.error === 'string' ? err.error : 'Evaluation failed')
        return
      }
      toast.success('Stage updated')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="eval-notes">Notes (optional)</Label>
        <Textarea
          id="eval-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes for this stage transition"
          rows={3}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {transitions.map((t) => (
          <Button
            key={t.value}
            variant={t.variant}
            size="sm"
            disabled={submitting}
            onClick={() => handleEvaluate(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
