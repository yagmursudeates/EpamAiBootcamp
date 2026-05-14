'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IdeaSchema, type IdeaInput } from '@/lib/validations'
import { CATEGORY_FIELDS } from '@/lib/categoryFields'
import type { DbIdea } from '@/types/db'

const CATEGORIES = [
  'Technical',
  'Process Improvement',
  'Client Solutions',
  'Cost Reduction',
  'Employee Experience',
] as const

interface IdeaFormProps {
  draft?: DbIdea
}

export default function IdeaForm({ draft }: IdeaFormProps = {}) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const filesRef = useRef<File[]>([])

  const updateFiles = (updater: (prev: File[]) => File[]) => {
    setFiles((prev) => {
      const next = updater(prev)
      filesRef.current = next
      return next
    })
  }
  const [submitting, setSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(draft?.category ?? null)
  const [metadata, setMetadata] = useState<Record<string, string>>(
    draft?.category_metadata ? JSON.parse(draft.category_metadata) : {}
  )

  const isEditMode = !!draft

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IdeaInput>({ resolver: zodResolver(IdeaSchema) })

  useEffect(() => {
    if (draft) {
      setValue('title', draft.title)
      setValue('description', draft.description)
      if (draft.category) setValue('category', draft.category as IdeaInput['category'])
    }
  }, [draft, setValue])

  const handleCategoryChange = (val: string) => {
    setValue('category', val as IdeaInput['category'])
    setSelectedCategory(val)
    setMetadata({})
  }

  const handleMetadataChange = (key: string, value: string) => {
    setMetadata((prev) => ({ ...prev, [key]: value }))
  }

  const saveDraft = async () => {
    const titleEl = document.getElementById('title') as HTMLInputElement | null
    const title = titleEl?.value?.trim()
    if (!title) { toast.error('Title is required to save a draft'); return }
    setSubmitting(true)
    try {
      const basePayload = {
        title,
        description: (document.getElementById('description') as HTMLTextAreaElement | null)?.value ?? '',
        category: selectedCategory ?? undefined,
        categoryMetadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      }
      let res: Response
      let ideaId: string
      if (isEditMode && draft) {
        // PATCH only updates fields; status stays as 'draft' (no status field sent)
        res = await fetch(`/api/ideas/${draft.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(basePayload),
        })
        ideaId = draft.id
      } else {
        res = await fetch('/api/ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...basePayload, status: 'draft' }),
        })
        const data = await res.json()
        ideaId = data.idea?.id
      }
      if (!res.ok) {
        const errBody = isEditMode ? await res.json().catch(() => ({})) : {}
        const errMsg = typeof errBody.error === 'string' ? errBody.error : 'Failed to save draft'
        toast.error(errMsg)
        return
      }
      for (const file of filesRef.current) {
        const form = new FormData()
        form.append('file', file)
        await fetch(`/api/ideas/${ideaId}/attachments`, { method: 'POST', body: form })
      }
      toast.success('Draft saved!')
      router.push('/dashboard')
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmit = async (data: IdeaInput) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        categoryMetadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      }
      let ideaId: string
      if (isEditMode && draft) {
        // promote draft to submitted
        const patchRes = await fetch(`/api/ideas/${draft.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, status: 'submitted' }),
        })
        if (!patchRes.ok) {
          const err = await patchRes.json().catch(() => ({}))
          toast.error(typeof err.error === 'string' ? err.error : 'Failed to submit idea')
          return
        }
        ideaId = draft.id
      } else {
        const res = await fetch('/api/ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json()
          toast.error(err.error ?? 'Failed to submit idea')
          return
        }
        const { idea } = await res.json()
        ideaId = idea.id
      }

      for (const file of filesRef.current) {
        const form = new FormData()
        form.append('file', file)
        const uploadRes = await fetch(`/api/ideas/${ideaId}/attachments`, {
          method: 'POST',
          body: form,
        })
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}))
          toast.warning(`"${file.name}" failed: ${err.error ?? uploadRes.status}`)
        }
      }

      toast.success('Idea submitted!')
      router.push('/dashboard')
    } finally {
      setSubmitting(false)
    }
  }

  const dynamicFields = selectedCategory ? CATEGORY_FIELDS[selectedCategory] : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} placeholder="Brief idea title" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe your idea in detail (max 2000 characters)"
          rows={6}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      {dynamicFields && (
        <div data-testid="dynamic-fields" className="space-y-4 rounded-lg border p-4 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {selectedCategory} Details (optional)
          </p>
          {dynamicFields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === 'text' && (
                <Input
                  id={field.key}
                  placeholder={field.placeholder}
                  value={metadata[field.key] ?? ''}
                  onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                />
              )}
              {field.type === 'textarea' && (
                <Textarea
                  id={field.key}
                  placeholder={field.placeholder}
                  rows={3}
                  value={metadata[field.key] ?? ''}
                  onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                />
              )}
              {field.type === 'select' && (
                <Select
                  value={metadata[field.key] ?? ''}
                  onValueChange={(val) => handleMetadataChange(field.key, val)}
                >
                  <SelectTrigger id={field.key}>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options!.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="attachment">Attachments (optional, up to 5 files)</Label>
        <Input
          id="attachment"
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? [])
            updateFiles((prev) => {
              const combined = [...prev, ...picked]
              const seen = new Set<string>()
              return combined
                .filter((f) => (seen.has(f.name) ? false : (seen.add(f.name), true)))
                .slice(0, 5)
            })
            e.target.value = ''
          }}
        />
        {files.length > 0 ? (
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1.5">
            <p className="text-xs font-medium text-foreground">{files.length} file{files.length > 1 ? 's' : ''} queued for upload:</p>
            <ul className="space-y-1">
              {files.map((f, i) => (
                <li key={f.name} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-foreground">📎 {f.name}</span>
                  <button
                    type="button"
                    className="shrink-0 text-xs text-destructive hover:underline"
                    onClick={() => updateFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            PDF, DOCX, PPTX, XLSX, PNG, JPG, GIF, WEBP, MP4, MOV · Max 20 MB each
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          className="flex-1"
          onClick={saveDraft}
        >
          {submitting ? 'Saving…' : 'Save Draft'}
        </Button>
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? 'Submitting…' : isEditMode ? 'Submit Idea' : 'Submit Idea'}
        </Button>
      </div>
    </form>
  )
}
