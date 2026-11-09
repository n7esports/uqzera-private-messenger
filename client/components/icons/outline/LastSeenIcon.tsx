import React from "react";

export function LastSeenIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M2.5 10S6 4 11 4s8.5 6 8.5 6-3.5 6-8.5 6-8.5-6-8.5-6Z"/>
  <circle cx="11" cy="10" r="2.5"/>
  <circle cx="19" cy="19" r="3.5"/>
  <path d="M19 17.5V19l1.5 1"/>
    </svg>
  );
}
