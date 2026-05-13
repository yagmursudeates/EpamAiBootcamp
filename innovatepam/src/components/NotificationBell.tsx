'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  idea_id: string
  message: string
  is_read: number
  created_at: string
  idea_title: string
}

export default function NotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    const res = await fetch('/api/notifications')
    if (!res.ok) return
    const data = await res.json()
    setNotifications(data.notifications)
    setUnreadCount(data.unreadCount)
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) fetchNotifications()
  }

  const handleClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await fetch(`/api/notifications/${notif.id}`, { method: 'PATCH' })
      setUnreadCount((c) => Math.max(0, c - 1))
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n))
      )
    }
    setOpen(false)
    router.push(`/ideas/${notif.idea_id}`)
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })))
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative px-2">
          <span className="text-lg">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Mark all as read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              onSelect={() => handleClick(notif)}
              className={`flex flex-col items-start gap-0.5 px-3 py-2 cursor-pointer ${
                !notif.is_read ? 'bg-blue-50/60 font-medium' : ''
              }`}
            >
              <span className="text-sm leading-snug">{notif.message}</span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(notif.created_at)}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
