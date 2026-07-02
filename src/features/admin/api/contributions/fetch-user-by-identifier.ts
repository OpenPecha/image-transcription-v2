import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { normalizeUserRole, type User } from '@/types'
import { contributionKeys } from './contribution-keys'

const PROFILE_STALE_MS = 20 * 60 * 1000

export async function fetchUserByIdentifier(email: string): Promise<User> {
  const date = new Date().toISOString()
  const user = (await apiClient.get(
    `/user/by-identifier/${encodeURIComponent(email)}?date=${encodeURIComponent(date)}`
  )) as User

  if (user?.role) {
    user.role = normalizeUserRole(user.role) ?? user.role
  }

  return user
}

export function useUserByIdentifier(email: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: contributionKeys.userByIdentifier(email ?? ''),
    queryFn: () => fetchUserByIdentifier(email as string),
    enabled: Boolean(email) && enabled,
    staleTime: PROFILE_STALE_MS,
    retry: 1,
  })
}
