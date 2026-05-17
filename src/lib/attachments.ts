const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'video/mp4',
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface AttachmentInput {
  mimetype: string;
  size: number;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAttachment(input: AttachmentInput): ValidationResult {
  if (!ALLOWED_MIME_TYPES.has(input.mimetype)) {
    return { valid: false, error: 'Invalid MIME type. Only PDF, Office documents, images, and MP4 are allowed.' };
  }
  if (input.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds the 10 MB limit.' };
  }
  return { valid: true };
}
