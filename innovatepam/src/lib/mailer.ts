import nodemailer from 'nodemailer'

let transport: nodemailer.Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

/** Replace the transport — used in tests to inject a mock. */
export function setTransport(t: nodemailer.Transporter): void {
  transport = t
}

/**
 * Send an evaluation result email to a submitter.
 * Returns immediately (no-op) when EMAIL_HOST is not configured.
 * Throws on SMTP error — callers should `.catch(console.error)`.
 */
export async function sendEvaluationEmail(
  to: string,
  subject: string,
  text: string
): Promise<void> {
  if (!process.env.EMAIL_HOST) return

  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? 'InnovatEPAM <noreply@innovatepam.local>',
    to,
    subject,
    text,
  })
}
