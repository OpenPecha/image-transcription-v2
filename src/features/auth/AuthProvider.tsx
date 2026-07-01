import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { setAuthTokenGetter } from '@/lib/auth'
import { AuthContext } from './auth-context'
import {
  clearDevUserEmail,
  getDevUserPostLoginPath,
  isDevAuthEnabled,
  persistDevUserEmail,
  readStoredDevUserEmail,
  resolveDevUserEmail,
} from './dev-users'
import { getUserByIdentifier } from './get-user-by-identifier'
import type { User } from '@/types'
import { useQuery } from '@tanstack/react-query'

interface AuthProviderProps {
  children: ReactNode
}

const EMAIL_IDENTIFIER_OVERRIDE_KEY = 'email_identifier_override'

/** Use `?email=` from the URL when present; otherwise fall back to Auth0 email. */
function getEmailIdentifierOverride(): string | null {
  const params = new URLSearchParams(window.location.search)
  const emailFromUrl = params.get('email')?.trim()
  if (emailFromUrl) {
    sessionStorage.setItem(EMAIL_IDENTIFIER_OVERRIDE_KEY, emailFromUrl)
    return emailFromUrl
  }
  return sessionStorage.getItem(EMAIL_IDENTIFIER_OVERRIDE_KEY)
}

function getQueryErrorStatus(error: Error | null): number | undefined {
  return (error as { response?: { status: number } } | null)?.response?.status
}

// Inner provider that uses Auth0 hooks
const AuthContextProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user: auth0User,
    getAccessTokenSilently,
    loginWithRedirect,
    logout: auth0Logout,
    error,
  } = useAuth0()

  useEffect(() => {
    if (isAuthenticated) {
      setAuthTokenGetter(getAccessTokenSilently)
    }
  }, [isAuthenticated, getAccessTokenSilently])

  const identifierEmail = getEmailIdentifierOverride() ?? auth0User?.email ?? null

  const {
    data: userDetails,
    isLoading: isQueryLoading,
    error: queryError,
  } = useQuery<User, Error>({
    queryKey: ['user-details', identifierEmail],
    queryFn: async () => {
      const token = await getAccessTokenSilently()
      localStorage.setItem('auth_token', token)
      return await getUserByIdentifier(identifierEmail!)
    },
    enabled: isAuthenticated && !!identifierEmail && !auth0Loading,
    retry: false,
  })

  const currentUser = useMemo(() => {
    if (userDetails) return userDetails
    if (isAuthenticated && identifierEmail && !isQueryLoading && queryError) {
      return { email: identifierEmail }
    }
    return null
  }, [userDetails, isAuthenticated, identifierEmail, isQueryLoading, queryError])

  const isPendingApproval = useMemo(() => {
    return getQueryErrorStatus(queryError) === 404
  }, [queryError])

  const isLoading = auth0Loading || (isAuthenticated && isQueryLoading && !currentUser)

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await getAccessTokenSilently()
      if (token) {
        localStorage.setItem('auth_token', token)
      }
      return token
    } catch (err) {
      console.error('Error getting Auth0 token:', err)
      return null
    }
  }, [getAccessTokenSilently])

  const login = useCallback((_email?: string) => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: `${window.location.origin}/callback`,
      },
    })
  }, [loginWithRedirect])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem(EMAIL_IDENTIFIER_OVERRIDE_KEY)

    auth0Logout({
      logoutParams: {
        returnTo: `${window.location.origin}/login`,
      },
    })
  }, [auth0Logout])

  const contextValue = useMemo(() => ({
    isAuthenticated,
    isLoading,
    currentUser,
    login,
    logout,
    getToken,
    error: error?.message || null,
    isPendingApproval,
  }), [isAuthenticated, isLoading, currentUser, login, logout, getToken, error, isPendingApproval])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Dev mode: skip Auth0, resolve user via GET /user/by-identifier/{email}
const DevAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [identifierEmail, setIdentifierEmail] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search)
    return resolveDevUserEmail(params.get('email')) ?? readStoredDevUserEmail()
  })

  const {
    data: userDetails,
    isLoading: isQueryLoading,
    error: queryError,
  } = useQuery<User, Error>({
    queryKey: ['dev-user-details', identifierEmail],
    queryFn: () => getUserByIdentifier(identifierEmail!),
    enabled: !!identifierEmail,
    retry: false,
  })

  const currentUser = userDetails ?? null
  const isAuthenticated = !!currentUser

  useEffect(() => {
    if (!userDetails || !identifierEmail) return

    persistDevUserEmail(identifierEmail)

    if (window.location.pathname === '/login') {
      window.location.href = getDevUserPostLoginPath(userDetails.role)
    }
  }, [userDetails, identifierEmail])

  const beginDevLogin = useCallback((email: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    persistDevUserEmail(normalizedEmail)
    setIdentifierEmail(normalizedEmail)
  }, [])

  const login = useCallback((emailOverride?: string) => {
    const params = new URLSearchParams(window.location.search)
    const email = resolveDevUserEmail(emailOverride ?? params.get('email'))

    if (!email) {
      console.error('Dev login requires an email')
      return
    }

    beginDevLogin(email)
  }, [beginDevLogin])

  const logout = useCallback(() => {
    clearDevUserEmail()
    setIdentifierEmail(null)
    window.location.href = '/login'
  }, [])

  const getToken = useCallback(async () => 'dev-token', [])

  const isLoading = !!identifierEmail && isQueryLoading && !currentUser

  const isPendingApproval = useMemo(() => {
    return getQueryErrorStatus(queryError) === 404
  }, [queryError])

  const contextValue = useMemo(() => ({
    isAuthenticated,
    isLoading,
    currentUser,
    login,
    logout,
    getToken,
    error: queryError?.message ?? null,
    isPendingApproval,
  }), [isAuthenticated, isLoading, currentUser, login, logout, getToken, queryError, isPendingApproval])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE
  const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || `${window.location.origin}/callback`

  const shouldUseDevAuth = isDevAuthEnabled()

  if (shouldUseDevAuth) {
    console.warn('Using dev auth provider — GET /user/by-identifier/{email}, no Auth0.')
    return <DevAuthProvider>{children}</DevAuthProvider>
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: 'openid profile email',
        audience: audience,
      }}
      useRefreshTokens={true}
      useRefreshTokensFallback={true}
      cacheLocation="localstorage"
    >
      <AuthContextProvider>{children}</AuthContextProvider>
    </Auth0Provider>
  )
}

export default AuthProvider
