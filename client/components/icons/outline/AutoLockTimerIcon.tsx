import React from "react";

export function AutoLockTimerIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="4.5" y="10.5" width="11" height="10" rx="2.5"/>
  <path d="M7 10.5V7.5a3 3 0 0 1 6 0v3"/>
  <circle cx="19" cy="6.5" r="3.5"/>
  <path d="M19 5v1.5l1 1"/>
    </svg>
  );
}
