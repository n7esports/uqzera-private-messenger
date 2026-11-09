import React from "react";

export function MediaVideoIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="3" y="4.5" width="18" height="15" rx="3"/>
  <path d="M10 8.8 15.5 12 10 15.2Z" fill="currentColor" stroke="none"/>
  <path d="M6.5 7.5h.01"/>
  <path d="M6.5 16.5h.01"/>
    </svg>
  );
}
