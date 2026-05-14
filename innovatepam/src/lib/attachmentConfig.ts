export const ALLOWED_MIMETYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/gif',
  'video/mp4',
])

export const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

export const MAX_ATTACHMENTS_PER_IDEA = 5
