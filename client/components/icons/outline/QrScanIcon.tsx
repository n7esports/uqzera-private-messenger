import React from "react";

export function QrScanIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M4 9V6a2 2 0 0 1 2-2h3"/>
  <path d="M15 4h3a2 2 0 0 1 2 2v3"/>
  <path d="M4 15v3a2 2 0 0 0 2 2h3"/>
  <path d="M20 15v3a2 2 0 0 1-2 2h-3"/>
  <rect x="8" y="8" width="2.5" height="2.5" rx=".5"/>
  <rect x="13.5" y="8" width="2" height="2" rx=".5"/>
  <rect x="8" y="13.5" width="2" height="2" rx=".5"/>
  <rect x="13.5" y="13.5" width="2.5" height="2.5" rx=".5"/>
  <path d="M4.5 12h15" stroke="var(--uqzera-accent, #10B981)"/>
    </svg>
  );
}
