'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  RotateCw,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Wifi,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface LiveAttendanceQRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export function LiveAttendanceQRModal({
  open,
  onOpenChange,
  title = 'Live Attendance QR Code',
}: LiveAttendanceQRModalProps) {
  const queryClient = useQueryClient();
  const [qrSvg, setQrSvg] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(true);
  const [recentScans, setRecentScans] = useState<Array<any>>([]);
  const [lastScanTimestamp, setLastScanTimestamp] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio chime on successful scan
  const playScanDing = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext not allowed or muted
    }
  }, []);

  // Fetch or generate active QR code
  const fetchActiveQR = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const res = await apiFetch(
        `/api/staff-attendance/qr/active${forceRefresh ? '?refresh=true' : ''}`
      );
      if (!res.ok) {
        toast.error('Failed to generate attendance QR code');
        return;
      }
      const data = await res.json();
      if (data.success && data.qrData) {
        setCode(data.code || '');
        setSecondsLeft(data.remainingSeconds || 30);

        // Generate clean SVG string for crisp vector rendering
        const svgString = await QRCode.toString(data.qrData, {
          type: 'svg',
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });
        setQrSvg(svgString);
      }
    } catch {
      toast.error('Network error loading QR code');
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll status to detect when a teacher scans and burns the token
  const pollStatus = useCallback(async () => {
    try {
      const res = await apiFetch('/api/staff-attendance/qr/status');
      if (!res.ok) return;
      const data = await res.json();

      if (data.recentScans) {
        setRecentScans(data.recentScans);
      }

      // Check if a new scan occurred
      if (data.lastScan && data.lastScan.timestamp > lastScanTimestamp) {
        setLastScanTimestamp(data.lastScan.timestamp);
        playScanDing();
        toast.success(`🎉 ${data.lastScan.userName} marked ${data.lastScan.action}!`, {
          description: `Time: ${data.lastScan.time} (Indian Standard Time)`,
        });

        // Instantly refresh the admin table in the background so marked status turns green!
        queryClient.invalidateQueries({ queryKey: ['staff-attendance'] });

        // The token was burned by the teacher! Immediately generate a fresh QR!
        fetchActiveQR(true);
      } else if (!data.isActive && secondsLeft <= 2) {
        // Expired naturally
        fetchActiveQR(true);
      }
    } catch {
      // transient poll error
    }
  }, [lastScanTimestamp, secondsLeft, playScanDing, fetchActiveQR, queryClient]);

  // Main lifecycle when dialog is open
  useEffect(() => {
    if (!open) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      queryClient.invalidateQueries({ queryKey: ['staff-attendance'] });
      return;
    }

    // Initial load
    fetchActiveQR();

    // 1-second interval for countdown ring
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          fetchActiveQR(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    // 2-second interval for status polling & instant scan detection
    pollRef.current = setInterval(() => {
      pollStatus();
    }, 2000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, fetchActiveQR, pollStatus]);

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Backup code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const progressPercent = (secondsLeft / 30) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'p-0 overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 transition-all duration-300',
          isFullscreen
            ? '!fixed !inset-0 !w-screen !h-screen !max-w-none !max-h-screen !rounded-none !z-50 !translate-x-0 !translate-y-0 !top-0 !left-0 flex flex-col justify-between overflow-y-auto'
            : 'sm:max-w-md md:max-w-lg max-h-[92vh] flex flex-col rounded-3xl'
        )}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 pb-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                <QrCode className="size-5 text-white" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-white leading-tight truncate">
                  {title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Live attendance QR code for staff check-in
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 h-8 px-2.5 rounded-xl text-xs gap-1.5 cursor-pointer border border-white/20 bg-white/10"
              >
                {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </Button>

              <Badge className="bg-white/15 hover:bg-white/20 text-white border-white/20 text-[11px] font-semibold gap-1.5 px-2.5 py-1">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Kiosk</span>
              </Badge>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="size-8 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shrink-0"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Center Content: QR Code Card */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-3.5">
          <div className="flex flex-col items-center justify-center text-center">
            {/* QR Card Container */}
            <div className="relative p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 shadow-inner flex flex-col items-center justify-center">
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 size-3.5 border-t-2 border-l-2 border-blue-600 dark:border-blue-400 rounded-tl-lg pointer-events-none" />
              <div className="absolute top-2 right-2 size-3.5 border-t-2 border-r-2 border-blue-600 dark:border-blue-400 rounded-tr-lg pointer-events-none" />
              <div className="absolute bottom-2 left-2 size-3.5 border-b-2 border-l-2 border-blue-600 dark:border-blue-400 rounded-bl-lg pointer-events-none" />
              <div className="absolute bottom-2 right-2 size-3.5 border-b-2 border-r-2 border-blue-600 dark:border-blue-400 rounded-br-lg pointer-events-none" />

              {/* QR Image Box */}
              <div
                className={cn(
                  'bg-white p-2.5 sm:p-3 rounded-2xl shadow-sm flex items-center justify-center overflow-hidden transition-all',
                  isFullscreen ? 'size-64 sm:size-80 md:size-96' : 'size-44 sm:size-48'
                )}
              >
                {loading && !qrSvg ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <RotateCw className="size-7 animate-spin text-blue-600" />
                    <span className="text-xs font-semibold">Generating Token...</span>
                  </div>
                ) : (
                  <div
                    className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                )}
              </div>

              {/* Rotating Expiry Countdown */}
              <div className="mt-2.5 flex items-center justify-center gap-2 w-full">
                <div className="relative size-5 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200 dark:text-zinc-700"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={secondsLeft <= 5 ? 'text-rose-500' : 'text-blue-600'}
                      strokeDasharray={`${progressPercent}, 100`}
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Auto-rotates in <strong className="text-blue-600 dark:text-blue-400">{secondsLeft}s</strong>
                </span>
              </div>
            </div>

            {/* 6-Digit Manual Backup Code */}
            <div className="mt-2.5 flex items-center gap-2 p-1.5 px-3 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Backup Code:
              </span>
              <span className="font-mono text-sm sm:text-base font-extrabold tracking-widest text-slate-900 dark:text-zinc-100">
                {code ? `${code.slice(0, 3)} ${code.slice(3)}` : '------'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="size-6 sm:size-7 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 transition-colors"
                title="Copy code"
              >
                {copiedCode ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>

          {/* Real-time Scan Feed */}
          {recentScans.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-2.5 bg-slate-50/50 dark:bg-zinc-900/40">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>Recent Live Scans</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">Live Feed</span>
              </div>
              <div className="space-y-1.5 max-h-20 overflow-y-auto">
                {recentScans.slice(0, 3).map((item, i) => (
                  <div
                    key={`${item.userId}-${item.timestamp}-${i}`}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                        {item.userName}
                      </span>
                    </div>
                    <Badge className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
                      {item.action} &bull; {item.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">Live session active</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchActiveQR(true)}
              disabled={loading}
              className="rounded-xl text-xs font-semibold gap-1.5 h-8 px-3"
            >
              <RotateCw className={loading ? 'size-3.5 animate-spin' : 'size-3.5'} />
              <span>Regenerate</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
