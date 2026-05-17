import { describe, it, expect } from 'vitest';
import { validateAttachment } from '@/lib/attachments';

// ─── T019: File attachment validation (US-002 AC-2, AC-4) ────────────────────

const TEN_MB = 10 * 1024 * 1024;

describe('validateAttachment', () => {
  it('should accept PDF MIME type', () => {
    const result = validateAttachment({ mimetype: 'application/pdf', size: 1024 });
    expect(result.valid).toBe(true);
  });

  it('should accept DOCX MIME type', () => {
    const result = validateAttachment({
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 1024,
    });
    expect(result.valid).toBe(true);
  });

  it('should accept PPTX MIME type', () => {
    const result = validateAttachment({
      mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: 1024,
    });
    expect(result.valid).toBe(true);
  });

  it('should accept XLSX MIME type', () => {
    const result = validateAttachment({
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 1024,
    });
    expect(result.valid).toBe(true);
  });

  it('should accept PNG MIME type', () => {
    const result = validateAttachment({ mimetype: 'image/png', size: 1024 });
    expect(result.valid).toBe(true);
  });

  it('should accept JPG/JPEG MIME types', () => {
    expect(validateAttachment({ mimetype: 'image/jpg', size: 1024 }).valid).toBe(true);
    expect(validateAttachment({ mimetype: 'image/jpeg', size: 1024 }).valid).toBe(true);
  });

  it('should accept GIF MIME type', () => {
    const result = validateAttachment({ mimetype: 'image/gif', size: 1024 });
    expect(result.valid).toBe(true);
  });

  it('should accept MP4 MIME type', () => {
    const result = validateAttachment({ mimetype: 'video/mp4', size: 1024 });
    expect(result.valid).toBe(true);
  });

  it('should reject a MIME type not in the allowlist', () => {
    // Arrange — security: executable file upload blocked (AC-2)
    const result = validateAttachment({ mimetype: 'application/x-executable', size: 1024 });

    // Assert
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/mime type/i);
  });

  it('should accept a file whose size is exactly 10 MB', () => {
    // Arrange — AC-2 boundary: exactly 10 MB is valid
    const result = validateAttachment({ mimetype: 'application/pdf', size: TEN_MB });
    expect(result.valid).toBe(true);
  });

  it('should reject a file whose size exceeds 10 MB', () => {
    // Arrange — AC-4: "File must be under 10 MB"
    const result = validateAttachment({ mimetype: 'application/pdf', size: TEN_MB + 1 });

    // Assert — derived from US-002 AC-4
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/10 mb/i);
  });
});
