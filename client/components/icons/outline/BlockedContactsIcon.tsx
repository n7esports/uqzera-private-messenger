import React from "react";

export function BlockedContactsIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="12" cy="8.5" r="3"/>
  <path d="M5.5 19a6.5 6.5 0 0 1 13 0"/>
  <path d="M4 4 20 20"/>
    </svg>
  );
}
