'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// Html5QrcodeScanner is loaded dynamically to avoid SSR issues
let Html5QrcodeScanner: typeof import('html5-qrcode').Html5QrcodeScanner;

type ScanResult = {
  success: boolean;
  message: string;
  attendeeName?: string;
  error?: string;
};

export function QRScanner({
  eventId,
  eventTitle,
  eventStartTime,
  eventEndTime,
}: {
  eventId: string;
  eventTitle: string;
  eventStartTime: string;
  eventEndTime: string;
}) {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const scannerRef = useRef<InstanceType<typeof import('html5-qrcode').Html5QrcodeScanner> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initScanner() {
      const { Html5QrcodeScanner: Scanner } = await import('html5-qrcode');

      if (!mounted) return;

      const scanner = new Scanner(
        'qr-reader',
        { fps: 10, qrbox: 250 },
        false,
      );

      scannerRef.current = scanner;

      scanner.render(
        async (decodedText: string) => {
          if (!mounted) return;
          scanner.pause(true);
          setIsPaused(true);

          try {
            const res = await fetch(`/api/scan/${eventId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: decodedText }),
            });
            const data: ScanResult = await res.json();
            setScanResult(data);
            if (data.success) setScanCount((c) => c + 1);
          } catch {
            setScanResult({ success: false, message: 'Network error — please try again', error: 'network' });
          }

          setTimeout(() => {
            if (!mounted) return;
            setScanResult(null);
            setIsPaused(false);
            scanner.resume();
          }, 2500);
        },
        (errorMessage: string) => {
          // QR not found in frame — ignore continuous not-found errors
          if (errorMessage.includes('permission')) {
            setCameraError('Camera permission denied. Please allow camera access and refresh.');
          }
        },
      );
    }

    initScanner().catch(() => {
      setCameraError('Failed to start camera. Please refresh the page.');
    });

    return () => {
      mounted = false;
      scannerRef.current?.clear().catch(() => {});
    };
  }, [eventId]);

  const startDate = new Date(eventStartTime).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const startTime = new Date(eventStartTime).toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4">
      {/* Header */}
      <div className="w-full max-w-sm mb-4">
        <Link
          href="/organizer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-lg font-semibold leading-tight">{eventTitle}</h1>
        <p className="text-sm text-muted-foreground">{startDate} at {startTime}</p>
        <p className="text-sm font-medium text-primary mt-1">
          {scanCount} attendee{scanCount !== 1 ? 's' : ''} scanned
        </p>
      </div>

      {/* Camera error */}
      {cameraError && (
        <div className="w-full max-w-sm rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive text-center">
          {cameraError}
        </div>
      )}

      {/* QR reader container */}
      <div className="w-full max-w-sm">
        <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
      </div>

      {/* Result overlay */}
      {scanResult && (
        <div
          className={cn(
            'fixed inset-0 flex flex-col items-center justify-center gap-4 p-8 z-50',
            scanResult.success
              ? 'bg-green-950/95'
              : 'bg-red-950/95',
          )}
        >
          {scanResult.success ? (
            <>
              <CheckCircle className="h-24 w-24 text-green-400" strokeWidth={1.5} />
              <p className="text-3xl font-bold text-green-300">Attendance Marked!</p>
              {scanResult.attendeeName && (
                <p className="text-xl text-green-200">{scanResult.attendeeName}</p>
              )}
            </>
          ) : (
            <>
              <XCircle className="h-24 w-24 text-red-400" strokeWidth={1.5} />
              <p className="text-2xl font-bold text-red-300 text-center">{scanResult.message}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
