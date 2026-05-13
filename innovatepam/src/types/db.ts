export interface DbUser {
  id: string
  name: string
  email: string
  password_hash: string
  role: 'submitter' | 'admin'
  created_at: string
}

export interface DbIdea {
  id: string
  title: string
  description: string
  category: string
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'draft'
  category_metadata: string | null
  submitter_id: string
  created_at: string
  updated_at: string
}

export interface DbAttachment {
  id: string
  idea_id: string
  filename: string
  filepath: string
  mimetype: string
  size: number
  created_at: string
}

export interface DbEvaluation {
  id: string
  idea_id: string
  evaluator_id: string
  decision: 'under_review' | 'accepted' | 'rejected'
  notes: string | null
  created_at: string
  updated_at: string
}
