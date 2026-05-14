import { z } from 'zod'
import type { IdeaScores } from '@/types/db'
export type { IdeaScores }

export const RegisterSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const IdeaSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  category: z.enum([
    'Technical',
    'Process Improvement',
    'Client Solutions',
    'Cost Reduction',
    'Employee Experience',
  ]),
  categoryMetadata: z.record(z.string(), z.unknown()).optional(),
  isAnonymous: z.boolean().optional().default(false),
})

export const DraftSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(2000).optional().default(''),
  category: z
    .enum([
      'Technical',
      'Process Improvement',
      'Client Solutions',
      'Cost Reduction',
      'Employee Experience',
    ])
    .optional(),
  categoryMetadata: z.record(z.string(), z.unknown()).optional(),
  isAnonymous: z.boolean().optional().default(false),
  status: z.enum(['draft', 'submitted']).optional().default('draft'),
})

export const IdeaUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  category: z
    .enum([
      'Technical',
      'Process Improvement',
      'Client Solutions',
      'Cost Reduction',
      'Employee Experience',
    ])
    .optional(),
  categoryMetadata: z.record(z.string(), z.unknown()).optional(),
  isAnonymous: z.boolean().optional(),
  status: z.enum(['submitted']).optional(), // only transition allowed via PATCH
})

const ScoreField = z.number().int().min(1).max(5)

export const ScoresSchema = z.object({
  innovation: ScoreField,
  feasibility: ScoreField,
  impact: ScoreField,
  clarity: ScoreField,
})

export const EvaluationSchema = z.object({
  decision: z.enum(['screening', 'under_review', 'accepted', 'rejected']),
  notes: z.string().optional(),
  scores: ScoresSchema.optional(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type IdeaInput = z.infer<typeof IdeaSchema>
export type DraftInput = z.infer<typeof DraftSchema>
export type IdeaUpdateInput = z.infer<typeof IdeaUpdateSchema>
export type EvaluationInput = z.infer<typeof EvaluationSchema>
