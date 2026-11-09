import React from "react";

export function RetryMessageIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M20 12a8 8 0 1 1-2.3-5.6"/>
  <path d="M20 4.5V9h-4.5"/>
  <path d="M9.5 9.5h4a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5H11L9 16v-1.5h-.5A1.5 1.5 0 0 1 7 13v-2a1.5 1.5 0 0 1 1.5-1.5Z"/>
    </svg>
  );
}
