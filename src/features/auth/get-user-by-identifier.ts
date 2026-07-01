import { apiClient } from '@/lib/axios'
import { normalizeUserRole, type User } from '@/types'

export async function getUserByIdentifier(email: string): Promise<User> {
  const date = new Date().toISOString()
  const user = (await apiClient.get(
    `/user/by-identifier/${encodeURIComponent(email)}?date=${date}`
  )) as User

  if (user?.role) {
    user.role = normalizeUserRole(user.role) ?? user.role
  }

  return user
}
