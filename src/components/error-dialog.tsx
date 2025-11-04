'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, X, Copy, CheckCircle } from 'lucide-react'

export interface ErrorDetails {
  message: string
  code?: string
  details?: string
  timestamp?: string
  component?: string
  action?: string
}

interface ErrorDialogProps {
  error: ErrorDetails | null
  onClose: () => void
}

export function ErrorDialog({ error, onClose }: ErrorDialogProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (error) {
      // Log to console as well
      console.error('[Error Dialog]', {
        ...error,
        timestamp: error.timestamp || new Date().toISOString()
      })
    }
  }, [error])

  const handleCopy = () => {
    const errorText = `
Error Report
============
Message: ${error?.message}
Code: ${error?.code || 'N/A'}
Details: ${error?.details || 'N/A'}
Component: ${error?.component || 'N/A'}
Action: ${error?.action || 'N/A'}
Timestamp: ${error?.timestamp || new Date().toISOString()}
`.trim()

    navigator.clipboard.writeText(errorText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!error) return null

  return (
    <Dialog open={!!error} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-red-500/20 bg-background">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <DialogTitle className="text-red-500">Error Occurred</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-left pt-2">
            {error.message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Details */}
          {(error.code || error.details || error.component || error.action) && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-2">
              {error.code && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Error Code:</span>
                  <span className="font-mono text-red-500">{error.code}</span>
                </div>
              )}
              {error.component && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Component:</span>
                  <span className="font-mono">{error.component}</span>
                </div>
              )}
              {error.action && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Action:</span>
                  <span className="font-mono">{error.action}</span>
                </div>
              )}
              {error.details && (
                <div className="text-sm pt-2 border-t border-red-500/20">
                  <span className="text-muted-foreground block mb-1">Details:</span>
                  <pre className="text-xs bg-background/50 p-2 rounded overflow-auto max-h-32">
                    {error.details}
                  </pre>
                </div>
              )}
              {error.timestamp && (
                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-red-500/20">
                  <span>Timestamp:</span>
                  <span className="font-mono">{new Date(error.timestamp).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Error
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Global error handler hook
export function useErrorHandler() {
  const [error, setError] = useState<ErrorDetails | null>(null)

  const handleError = (err: unknown, component?: string, action?: string) => {
    let errorDetails: ErrorDetails

    if (err instanceof Error) {
      errorDetails = {
        message: err.message,
        code: (err as any).code,
        details: (err as any).details || err.stack,
        timestamp: new Date().toISOString(),
        component,
        action
      }
    } else if (typeof err === 'string') {
      errorDetails = {
        message: err,
        timestamp: new Date().toISOString(),
        component,
        action
      }
    } else {
      errorDetails = {
        message: 'An unknown error occurred',
        details: JSON.stringify(err, null, 2),
        timestamp: new Date().toISOString(),
        component,
        action
      }
    }

    setError(errorDetails)

    // Also log to console
    console.error(`[${component || 'Unknown'}] ${action || 'Error'}:`, err)
  }

  const clearError = () => setError(null)

  return { error, handleError, clearError }
}
