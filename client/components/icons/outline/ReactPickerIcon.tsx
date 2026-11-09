import React from "react";

export function ReactPickerIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="2.5" y="7" width="19" height="10" rx="4.5"/>
  <circle cx="8" cy="12" r="1.5"/>
  <circle cx="12" cy="12" r="1.5" fill="var(--uqzera-accent, #10B981)" stroke="none"/>
  <circle cx="16" cy="12" r="1.5"/>
    </svg>
  );
}
