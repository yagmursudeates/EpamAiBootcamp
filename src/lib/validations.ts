import { z } from 'zod';

export const registrationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const IdeaCategory = z.enum([
  'Technical',
  'Process Improvement',
  'Client Solutions',
  'Cost Reduction',
  'Employee Experience',
]);

export const ideaSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  category: IdeaCategory,
});

export const evaluationSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  notes: z.string().optional(),
});
