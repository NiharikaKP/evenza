'use client'

import { useState, useEffect } from 'react'
import { X, Download, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(true) // start hidden, reveal after mount

  useEffect(() => {
    // Don't show if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Don't show if user previously dismissed
    if (sessionStorage.getItem('pwa-prompt-dismissed')) return

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)
    setDismissed(false)

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    sessionStorage.setItem('pwa-prompt-dismissed', '1')
    setDismissed(true)
  }

  async function install() {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') setInstallEvent(null)
    dismiss()
  }

  // Nothing to show: dismissed, or not iOS and no install event
  if (dismissed || (!isIOS && !installEvent)) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border bg-background shadow-lg">
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          E
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Install Evenza</p>
          {isIOS ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tap <Share className="inline h-3 w-3" /> then &ldquo;Add to Home Screen&rdquo; to install.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add to your home screen for a faster, app-like experience.
            </p>
          )}
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {!isIOS && installEvent && (
        <div className="border-t px-4 py-2">
          <Button size="sm" className="w-full gap-2" onClick={install}>
            <Download className="h-4 w-4" />
            Install
          </Button>
        </div>
      )}
    </div>
  )
}
