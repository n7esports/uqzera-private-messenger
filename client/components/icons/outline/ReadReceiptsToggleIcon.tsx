import React from "react";

export function ReadReceiptsToggleIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="2.5" y="7" width="19" height="10" rx="5"/>
  <circle cx="17.5" cy="12" r="3.2" fill="var(--uqzera-accent, #10B981)" stroke="none"/>
  <path d="m4.5 12.2 1.8 1.8 3.2-3.8"/>
  <path d="m9 12.2 1.8 1.8 3.2-3.8"/>
    </svg>
  );
}
