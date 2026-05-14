'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { EvaluationInput, IdeaScores } from '@/lib/validations'

const SCORE_DIMENSIONS: { key: keyof IdeaScores; label: string }[] = [
  { key: 'innovation',  label: 'Innovation'  },
  { key: 'feasibility', label: 'Feasibility' },
  { key: 'impact',      label: 'Impact'      },
  { key: 'clarity',     label: 'Clarity'     },
]

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
  currentScores?: IdeaScores | null
}

export default function EvaluationForm({
  ideaId,
  currentStatus,
  currentNotes,
  currentScores,
}: EvaluationFormProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(currentNotes ?? '')
  const [scores, setScores] = useState<IdeaScores>(
    currentScores ?? { innovation: 3, feasibility: 3, impact: 3, clarity: 3 }
  )
  const [submitting, setSubmitting] = useState(false)

  const transitions = TRANSITIONS[currentStatus] ?? TRANSITIONS['submitted']

  const handleEvaluate = async (decision: EvaluationInput['decision']) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/ideas/${ideaId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes: notes || undefined, scores }),
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
      <div className="space-y-3">
        <Label>Scores (1–5)</Label>
        <div className="grid grid-cols-2 gap-3">
          {SCORE_DIMENSIONS.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold tabular-nums">{scores[key]}</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setScores((prev) => ({ ...prev, [key]: v }))}
                    className={`flex-1 h-7 rounded text-xs font-medium transition-colors ${
                      scores[key] >= v
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Average: {(Object.values(scores).reduce((a, b) => a + b, 0) / 4).toFixed(1)} / 5
        </p>
      </div>

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
