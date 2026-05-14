import db from '@/lib/db'

export function isBlindMode(): boolean {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'blind_mode'").get() as { value: string } | undefined
  return row?.value === '1'
}

export function setBlindMode(enabled: boolean): void {
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('blind_mode', ?)").run(enabled ? '1' : '0')
}
