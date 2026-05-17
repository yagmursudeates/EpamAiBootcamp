import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';

export interface TestNotification {
  id: string;
  user_id: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface InsertTestNotificationOptions {
  id?: string;
  message?: string;
  is_read?: number;
  created_at?: string;
}

/**
 * Inserts a notification row into the test database.
 * Uses safe defaults merged with any provided overrides.
 *
 * Constitution §6 — Helpers: insertTestNotification() in src/__tests__/helpers/.
 */
export function insertTestNotification(
  db: Database.Database,
  userId: string,
  overrides: InsertTestNotificationOptions = {}
): TestNotification {
  const notification: TestNotification = {
    id: overrides.id ?? randomUUID(),
    user_id: userId,
    message: overrides.message ?? 'Your idea has been accepted',
    is_read: overrides.is_read ?? 0,
    created_at: overrides.created_at ?? new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO notifications (id, user_id, message, is_read, created_at)
     VALUES (@id, @user_id, @message, @is_read, @created_at)`
  ).run(notification);

  return notification;
}
