import { UserRole } from '@/types'

const DEV_USER_EMAIL_KEY = 'dev_user_email'

export function isDevAuthEnabled(): boolean {
  const useDevAuth = import.meta.env.VITE_DEV_AUTH === 'true'
  const urlParams = new URLSearchParams(window.location.search)
  const devModeFromUrl = urlParams.get('dev') === 'true'
  const storedDevMode = localStorage.getItem('dev_auth_mode') === 'true'

  if (devModeFromUrl && !storedDevMode) {
    localStorage.setItem('dev_auth_mode', 'true')
  }

  const domain = import.meta.env.VITE_AUTH0_DOMAIN
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID

  return useDevAuth || devModeFromUrl || storedDevMode || !domain || !clientId
}

export function resolveDevUserEmail(email?: string | null): string | null {
  const normalized = email?.trim().toLowerCase()
  return normalized || null
}

export function getDevUserPostLoginPath(role?: string): string {
  return role === UserRole.Admin ? '/dashboard' : '/workspace'
}

export function persistDevUserEmail(email: string): void {
  localStorage.setItem(DEV_USER_EMAIL_KEY, email)
}

export function readStoredDevUserEmail(): string | null {
  return localStorage.getItem(DEV_USER_EMAIL_KEY)
}

export function clearDevUserEmail(): void {
  localStorage.removeItem(DEV_USER_EMAIL_KEY)
}
