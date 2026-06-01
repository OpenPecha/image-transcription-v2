import { AlertTriangle, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface WrongAppDialogProps {
  url: string | null
}

export function WrongAppDialog({ url }: WrongAppDialogProps) {
  const handleRedirect = () => {
    if (url) {
      window.location.href = url
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="[&>button]:hidden max-w-md border-destructive/20"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            Wrong Application
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            Your account is assigned to a different web tool. You cannot access this application.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 p-4 rounded-lg bg-muted/50 border border-border flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Your Correct Web Tool
          </span>
          <span className="text-sm font-medium text-foreground break-all px-2">
            {url || 'Not configured'}
          </span>
        </div>

        <DialogFooter className="sm:justify-center">
          {url ? (
            <Button
              onClick={handleRedirect}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              Go to Correct Tool
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <p className="text-xs text-destructive font-medium">
              Please contact your administrator to configure your application access.
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
