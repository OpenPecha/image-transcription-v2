import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, LogIn, FileText, CheckCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { readStoredDevUserEmail } from './dev-users'
import { useAuth } from './use-auth'

const isDevAuth = import.meta.env.VITE_DEV_AUTH === 'true'

function getInitialDevEmail(): string {
  const params = new URLSearchParams(window.location.search)
  return params.get('email')?.trim() ?? readStoredDevUserEmail() ?? ''
}

const featureKeys = [
  {
    icon: FileText,
    titleKey: 'features.transcription.title',
    descriptionKey: 'features.transcription.description',
  },
  {
    icon: CheckCircle,
    titleKey: 'features.review.title',
    descriptionKey: 'features.review.description',
  },
  {
    icon: Users,
    titleKey: 'features.collaboration.title',
    descriptionKey: 'features.collaboration.description',
  },
]

export function LoginForm() {
  const { t } = useTranslation('auth')
  const { login, isLoading } = useAuth()
  const [devEmail, setDevEmail] = useState(getInitialDevEmail)

  const trimmedDevEmail = devEmail.trim()
  const canDevSignIn = trimmedDevEmail.length > 0 && !isLoading

  const handleLogin = () => {
    if (isDevAuth) {
      if (!canDevSignIn) return
      login(trimmedDevEmail)
      return
    }

    login()
  }

  const handleDevEmailKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && canDevSignIn) {
      handleLogin()
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('login.title')}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {t('login.subtitle')}
        </p>
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-xl">{t('login.welcome')}</CardTitle>
          <CardDescription>
            {isDevAuth ? t('login.devSignInPrompt') : t('login.signInPrompt')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isDevAuth ? (
            <div className="space-y-2">
              <Label htmlFor="dev-email">{t('login.devEmailLabel')}</Label>
              <Input
                id="dev-email"
                type="email"
                autoComplete="email"
                placeholder={t('login.devEmailPlaceholder')}
                value={devEmail}
                onChange={(event) => setDevEmail(event.target.value)}
                onKeyDown={handleDevEmailKeyDown}
                disabled={isLoading}
              />
            </div>
          ) : null}

          <Button
            onClick={handleLogin}
            className="w-full h-11 text-base"
            disabled={isDevAuth ? !canDevSignIn : isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('login.connecting')}
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                {isDevAuth ? t('login.devSignIn') : t('login.signInWithAuth0')}
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t('login.features')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {featureKeys.map((feature) => (
              <div
                key={feature.titleKey}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
              >
                <feature.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t(feature.titleKey)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        {isDevAuth ? t('login.devAuthHint') : t('login.secureAuth')}
      </p>
    </div>
  )
}
