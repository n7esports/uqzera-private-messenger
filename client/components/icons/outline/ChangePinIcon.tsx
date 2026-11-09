import React from "react";

export function ChangePinIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="3.5" y="3.5" width="12" height="12" rx="3"/>
  <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none"/>
  <circle cx="12" cy="7" r="1.2" fill="currentColor" stroke="none"/>
  <circle cx="7" cy="12" r="1.2" fill="currentColor" stroke="none"/>
  <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>
  <path d="M14.5 20.5v-1.8l4.8-4.8a1.4 1.4 0 0 1 2 0l.1.1a1.4 1.4 0 0 1 0 2l-4.8 4.8h-2.1Z"/>
    </svg>
  );
}
