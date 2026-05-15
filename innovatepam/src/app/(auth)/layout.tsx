export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, oklch(0.45 0.18 255) 0%, oklch(0.55 0.15 210) 50%, oklch(0.65 0.14 185) 100%)' }}
    >
      {/* decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'oklch(0.85 0.2 200)' }} />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'oklch(0.75 0.22 280)' }} />
      <div className="w-full max-w-sm relative z-10">{children}</div>
    </div>
  )
}
