'use client';

import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  message: string;
  is_read: number;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // silently ignore — bell is non-critical UI
    }
  }

  async function markAllRead() {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      await fetchNotifications();
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function handleBellClick() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      await markAllRead();
    }
  }

  return (
    <div className="notification-bell">
      <button
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        onClick={handleBellClick}
        type="button"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge" data-testid="unread-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown" role="list">
          {notifications.length === 0 ? (
            <p className="notification-empty">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} role="listitem" className="notification-item">
                <p>{n.message}</p>
                <time dateTime={n.created_at}>
                  {new Date(n.created_at).toLocaleDateString()}
                </time>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
