'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import NotificationBell from '@/components/NotificationBell'

export default function Navbar() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const homeHref = session?.user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={homeHref} className="font-extrabold text-lg tracking-tight"
          style={{ background: 'linear-gradient(90deg, oklch(0.45 0.18 255), oklch(0.6 0.15 200))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          InnovatEPAM
        </Link>

        <div className="flex items-center gap-3">
          {session?.user?.role === 'submitter' && (
            <Button asChild size="sm" variant="default">
              <Link href="/submit">+ New Idea</Link>
            </Button>
          )}

          {session?.user && <NotificationBell />}

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {session.user.name ?? session.user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  {session.user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
