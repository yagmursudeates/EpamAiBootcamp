import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import nodemailer from 'nodemailer'

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSubject(decision: string, title: string): string {
  const humanDecision: Record<string, string> = {
    accepted: 'accepted',
    rejected: 'rejected',
    under_review: 'is now under review',
  }
  return `[InnovatEPAM] Your idea '${title}' was ${humanDecision[decision] ?? decision}`
}

// ── Tests: sendEvaluationEmail ────────────────────────────────────────────────

describe('sendEvaluationEmail', () => {
  // We import after tests so we can control env vars per test
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('calls sendMail with correct to, subject, and text when EMAIL_HOST is set', async () => {
    process.env.EMAIL_HOST = 'smtp.ethereal.email'
    process.env.EMAIL_PORT = '587'
    process.env.EMAIL_USER = 'test@ethereal.email'
    process.env.EMAIL_PASS = 'testpass'
    process.env.EMAIL_FROM = 'InnovatEPAM <noreply@test.local>'

    const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'test-id' })
    const createTransportSpy = vi
      .spyOn(nodemailer, 'createTransport')
      .mockReturnValue({ sendMail: sendMailMock } as unknown as nodemailer.Transporter)

    const { sendEvaluationEmail } = await import('@/lib/mailer')

    await sendEvaluationEmail(
      'alice@epam.com',
      "[InnovatEPAM] Your idea 'My Idea' was accepted",
      "Your idea 'My Idea' was accepted."
    )

    expect(createTransportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: 'test@ethereal.email', pass: 'testpass' },
      })
    )
    expect(sendMailMock).toHaveBeenCalledOnce()
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'alice@epam.com',
        subject: "[InnovatEPAM] Your idea 'My Idea' was accepted",
        text: "Your idea 'My Idea' was accepted.",
      })
    )
  })

  it('skips sending and returns without error when EMAIL_HOST is not set', async () => {
    delete process.env.EMAIL_HOST

    const sendMailMock = vi.fn()
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock,
    } as unknown as nodemailer.Transporter)

    const { sendEvaluationEmail } = await import('@/lib/mailer')

    await expect(
      sendEvaluationEmail('alice@epam.com', 'subject', 'body')
    ).resolves.toBeUndefined()

    expect(sendMailMock).not.toHaveBeenCalled()
  })

  it('does not throw when the transport rejects (errors are swallowed by caller)', async () => {
    process.env.EMAIL_HOST = 'smtp.ethereal.email'
    process.env.EMAIL_PORT = '587'
    process.env.EMAIL_USER = 'u'
    process.env.EMAIL_PASS = 'p'
    process.env.EMAIL_FROM = 'noreply@test.local'

    const sendMailMock = vi.fn().mockRejectedValue(new Error('SMTP timeout'))
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock,
    } as unknown as nodemailer.Transporter)

    const { sendEvaluationEmail } = await import('@/lib/mailer')

    // sendEvaluationEmail itself rejects — caller is responsible for .catch()
    await expect(
      sendEvaluationEmail('alice@epam.com', 'subject', 'body')
    ).rejects.toThrow('SMTP timeout')
  })

  it('allows replacing the transport via setTransport for test injection', async () => {
    process.env.EMAIL_HOST = 'smtp.ethereal.email'
    process.env.EMAIL_PORT = '587'
    process.env.EMAIL_USER = 'u'
    process.env.EMAIL_PASS = 'p'
    process.env.EMAIL_FROM = 'noreply@test.local'

    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: vi.fn(),
    } as unknown as nodemailer.Transporter)

    const { sendEvaluationEmail, setTransport } = await import('@/lib/mailer')

    const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'injected' })
    const mockTransport = { sendMail: mockSendMail } as unknown as nodemailer.Transporter
    setTransport(mockTransport)

    await sendEvaluationEmail('alice@epam.com', 'subject', 'body')

    expect(mockSendMail).toHaveBeenCalledOnce()
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'alice@epam.com' })
    )
  })
})

// ── Tests: email subject format ───────────────────────────────────────────────

describe('email subject format', () => {
  it('formats subject correctly for each decision type', () => {
    expect(buildSubject('accepted', 'My Idea')).toBe(
      "[InnovatEPAM] Your idea 'My Idea' was accepted"
    )
    expect(buildSubject('rejected', 'My Idea')).toBe(
      "[InnovatEPAM] Your idea 'My Idea' was rejected"
    )
    expect(buildSubject('under_review', 'My Idea')).toBe(
      "[InnovatEPAM] Your idea 'My Idea' was is now under review"
    )
  })
})
