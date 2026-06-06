import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { LoadingSpinner } from '@/components/common'
import { isUserRoleAllowed, type UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!currentUser.role) {
    return <Navigate to="/pending-approval" replace />
  }

  if (allowedRoles && !isUserRoleAllowed(currentUser.role, allowedRoles)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
