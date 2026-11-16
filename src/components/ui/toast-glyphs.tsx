import React from "react";

/**
 * Aurora Toast Document Glyph
 * Exact recreation of the folded-corner document with vertical gradient
 * and horizontal slit lines from the Aurora Toast design reference.
 */
export function DocumentGlyph({ className = "w-[26px] h-[32px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aurora-doc-grad" x1="14" y1="0" x2="14" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E5E7EB" />
          <stop offset="70%" stopColor="#9CA3AF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4B5563" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="aurora-fold-grad" x1="21.5" y1="0.5" x2="21.5" y2="8.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E5E7EB" />
          <stop offset="100%" stopColor="#9CA3AF" />
        </linearGradient>
      </defs>

      {/* Main sheet body with clipped top-right corner */}
      <path
        d="M2.5 3.5C2.5 1.84315 3.84315 0.5 5.5 0.5H17.5L25.5 8.5V30.5C25.5 32.1569 24.1569 33.5 22.5 33.5H5.5C3.84315 33.5 2.5 32.1569 2.5 30.5V3.5Z"
        fill="url(#aurora-doc-grad)"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1"
      />

      {/* Folded corner flap */}
      <path
        d="M17.5 0.5L25.5 8.5H19.5C18.3954 8.5 17.5 7.60457 17.5 6.5V0.5Z"
        fill="url(#aurora-fold-grad)"
        fillOpacity="0.85"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1"
      />

      {/* First horizontal line slit */}
      <rect x="6.5" y="10" width="9.5" height="2.5" rx="1.25" fill="#374151" fillOpacity="0.55" />
      {/* Second horizontal line slit */}
      <rect x="6.5" y="15.5" width="13.5" height="2.5" rx="1.25" fill="#374151" fillOpacity="0.4" />
    </svg>
  );
}

/**
 * Aurora Toast Success Glyph (Emerald badge)
 */
export function SuccessGlyph({ className = "w-[26px] h-[26px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aurora-success-grad" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="13" fill="url(#aurora-success-grad)" fillOpacity="0.18" stroke="#34D399" strokeWidth="1.6" />
      <path d="M8.5 14.2L12 17.7L19.5 10.3" stroke="#34D399" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Aurora Toast Error Glyph (Rose alert badge)
 */
export function ErrorGlyph({ className = "w-[26px] h-[26px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aurora-error-grad" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="13" fill="url(#aurora-error-grad)" fillOpacity="0.18" stroke="#F87171" strokeWidth="1.6" />
      <path d="M9.5 9.5L18.5 18.5M18.5 9.5L9.5 18.5" stroke="#F87171" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Aurora Toast Warning Glyph (Amber badge)
 */
export function WarningGlyph({ className = "w-[26px] h-[26px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aurora-warning-grad" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="13" fill="url(#aurora-warning-grad)" fillOpacity="0.18" stroke="#FBBF24" strokeWidth="1.6" />
      <path d="M14 8.5V14.5M14 18.5H14.01" stroke="#FBBF24" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Aurora Toast Loading Spinner
 */
export function LoadingGlyph({ className = "w-[24px] h-[24px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} animate-spin`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Aurora Toast Close Cross Icon
 */
export function CloseIcon({ className = "w-[12px] h-[12px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" />
    </svg>
  );
}
