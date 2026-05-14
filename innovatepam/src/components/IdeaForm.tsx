'use client'

import { useState } from 'react'
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

const CATEGORIES = [
  'Technical',
  'Process Improvement',
  'Client Solutions',
  'Cost Reduction',
  'Employee Experience',
] as const

export default function IdeaForm() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IdeaInput>({ resolver: zodResolver(IdeaSchema) })

  const handleCategoryChange = (val: string) => {
    setValue('category', val as IdeaInput['category'])
    setSelectedCategory(val)
    setMetadata({})
  }

  const handleMetadataChange = (key: string, value: string) => {
    setMetadata((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (data: IdeaInput) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        categoryMetadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      }
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

      for (const file of files) {
        const form = new FormData()
        form.append('file', file)
        const uploadRes = await fetch(`/api/ideas/${idea.id}/attachments`, {
          method: 'POST',
          body: form,
        })
        if (!uploadRes.ok) {
          toast.warning(`Failed to upload "${file.name}"`)
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

      <div className="space-y-1.5">
        <Label htmlFor="attachment">Attachments (optional, up to 5 files)</Label>
        <Input
          id="attachment"
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mov"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 5))}
        />
        {files.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {files.map((f) => (
              <li key={f.name}>• {f.name}</li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">
          Accepted: PDF, DOCX, PPTX, XLSX, PNG, JPG, GIF, WEBP, MP4, MOV · Max 20 MB each
        </p>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Submitting…' : 'Submit Idea'}
      </Button>
    </form>
  )
}
