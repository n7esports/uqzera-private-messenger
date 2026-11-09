import React from "react";

export function CopyMessageIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M9 5.5h7A2.5 2.5 0 0 1 18.5 8v5a2.5 2.5 0 0 1-2.5 2.5h-1"/>
  <path d="M6.5 8.5h7A2.5 2.5 0 0 1 16 11v4a2.5 2.5 0 0 1-2.5 2.5H9.5L7 20v-2.5h-.5A2.5 2.5 0 0 1 4 15v-4a2.5 2.5 0 0 1 2.5-2.5Z"/>
    </svg>
  );
}
