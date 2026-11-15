'use client';

import React from "react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: React.ReactNode;
}

export function GlobalErrorBoundary({ children }: Props) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => {
        const eventId = Sentry.lastEventId();
        const message = (error as Error | undefined)?.message;

        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-center">
            <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 border border-border">
              <div className="size-14 bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                An unexpected error occurred. Our team has been notified and we're looking into it.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => resetError()}
                  className="w-full h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-colors"
                >
                  Try Again
                </button>

                <button
                  type="button"
                  onClick={() => (window.location.href = '/')}
                  className="w-full h-10 px-6 rounded-xl bg-card hover:bg-accent text-foreground font-semibold text-sm border border-border transition-colors"
                >
                  Go to Homepage
                </button>
              </div>

                  {(message || eventId) && (
                    <div className="mt-7 pt-5 border-t border-border">
                      {eventId && (
                        <p className="text-xs text-muted-foreground">
                          Error ID: <span className="font-mono">{eventId}</span>
                        </p>
                      )}
                      {process.env.NODE_ENV !== "production" && message && (
                        <p className="mt-2 text-xs text-muted-foreground font-mono break-words">
                          {message}
                        </p>
                      )}
                    </div>
                  )}
            </div>
          </div>
        );
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
