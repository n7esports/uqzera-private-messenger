import React from "react";

export function StarMessageIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M5 8h6a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 11 16H7l-3.5 2.5V16H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z"/>
  <path d="M18 4.5l1.3 3.1 3.4.3-2.6 2.3.8 3.3-2.9-1.7-2.9 1.7.8-3.3-2.6-2.3 3.4-.3L18 4.5Z" fill="currentColor" stroke="none"/>
    </svg>
  );
}
