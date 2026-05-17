import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { getDb } from '@/lib/db';
import { ideaSchema } from '@/lib/validations';
import { validateAttachment } from '@/lib/attachments';

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? 'uploads';

const EXT_MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  png: 'image/png',
  jpg: 'image/jpg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  mp4: 'video/mp4',
};

function inferMimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXT_MIME_MAP[ext] ?? 'application/octet-stream';
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const ideas = db
    .prepare(
      `SELECT id, title, description, category, status, created_at, updated_at
       FROM ideas WHERE submitter_id = ? ORDER BY created_at DESC`
    )
    .all(session.user.id);

  return NextResponse.json({ ideas });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let fields: { title?: unknown; description?: unknown; category?: unknown };
  let file: File | null = null;

  // Clone the request before attempting formData() so that if formData()
  // consumes the body (even on error), we can still read JSON from the clone.
  const jsonFallback = request.clone() as NextRequest;

  // Try formData() first — handles multipart/form-data and jsdom test environments
  // where formData() is mocked on the instance to work around jsdom limitations.
  let formDataParsed = false;
  try {
    const formData = await request.formData();
    const rawTitle = formData.get('title');
    if (rawTitle !== null) {
      fields = {
        title: rawTitle,
        description: formData.get('description'),
        category: formData.get('category'),
      };
      const maybeFile = formData.get('attachment');
      if (maybeFile instanceof File && maybeFile.size > 0) {
        file = maybeFile;
      } else if (maybeFile !== null && typeof maybeFile !== 'string') {
        const blobLike = maybeFile as Blob & { name?: string };
        if (blobLike.size > 0) file = blobLike as File;
      }
      formDataParsed = true;
    }
  } catch {
    // Not a form — fall through to JSON
  }

  if (!formDataParsed) {
    try {
      fields = await jsonFallback.json();
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 422 });
    }
  }

  const parsed = ideaSchema.safeParse(fields);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  // Validate attachment BEFORE touching the DB (test: no idea row on rejection)
  let effectiveMime: string | undefined;
  if (file) {
    effectiveMime = file.type || inferMimeFromFilename(file.name);
    const validation = validateAttachment({ mimetype: effectiveMime, size: file.size });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }
  }

  const { title, description, category } = parsed.data;
  const db = getDb();
  const ideaId = randomUUID();
  const submitterId = session.user.id;

  db.prepare(
    `INSERT INTO ideas (id, title, description, category, status, submitter_id)
     VALUES (?, ?, ?, ?, 'submitted', ?)`
  ).run(ideaId, title, description, category, submitterId);

  let attachment: { id: string; filename: string; filepath: string } | undefined;

  if (file && effectiveMime) {
    const attachmentId = randomUUID();
    const filename = file.name;
    const filepath = path.join(UPLOADS_DIR, attachmentId + '_' + filename);

    // arrayBuffer() may be absent in some test environments (jsdom); fall back
    // to an empty buffer — fs.writeFile is mocked in those environments.
    const ab =
      typeof (file as File).arrayBuffer === 'function'
        ? await (file as File).arrayBuffer()
        : new ArrayBuffer(0);
    const buffer = Buffer.from(ab);
    await fs.writeFile(filepath, buffer);

    db.prepare(
      `INSERT INTO attachments (id, idea_id, filename, filepath, mimetype, size)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(attachmentId, ideaId, filename, filepath, effectiveMime, file.size);

    attachment = { id: attachmentId, filename, filepath };
  }

  return NextResponse.json(
    {
      idea: {
        id: ideaId,
        title,
        description,
        category,
        status: 'submitted',
        submitter_id: submitterId,
        ...(attachment ? { attachment } : {}),
      },
    },
    { status: 201 }
  );
}
