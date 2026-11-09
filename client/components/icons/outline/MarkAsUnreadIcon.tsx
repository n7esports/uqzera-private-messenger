import React from "react";

export function MarkAsUnreadIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path d="M6 4h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6.5L6 20v-4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/>
  <circle cx="17" cy="8" r="2.2" fill="var(--uqzera-accent, #10B981)" stroke="none"/>
    </svg>
  );
}
