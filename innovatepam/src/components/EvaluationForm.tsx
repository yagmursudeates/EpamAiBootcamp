'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EvaluationSchema, type EvaluationInput } from '@/lib/validations'

interface EvaluationFormProps {
  ideaId: string
  currentDecision?: string
  currentNotes?: string
}

const DECISION_LABELS: Record<string, string> = {
  under_review: 'Mark as Under Review',
  accepted: 'Accept',
  rejected: 'Reject',
}

export default function EvaluationForm({
  ideaId,
  currentDecision,
  currentNotes,
}: EvaluationFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EvaluationInput>({
    resolver: zodResolver(EvaluationSchema),
    defaultValues: {
      decision: (currentDecision as EvaluationInput['decision']) ?? undefined,
      notes: currentNotes ?? '',
    },
  })

  const onSubmit = async (data: EvaluationInput) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/ideas/${ideaId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Evaluation failed')
        return
      }
      toast.success('Evaluation saved')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Decision</Label>
        <Select
          defaultValue={currentDecision}
          onValueChange={(val) => setValue('decision', val as EvaluationInput['decision'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select decision" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DECISION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.decision && (
          <p className="text-sm text-destructive">{errors.decision.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Add evaluation notes or feedback"
          rows={4}
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Saving…' : 'Save Evaluation'}
      </Button>
    </form>
  )
}
