import React from "react";

export function ReplyIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M9.5 6.5 4 12l5.5 5.5"/>
  <path d="M4 12h8.2a5.3 5.3 0 0 1 5.3 5.3V19"/>
    </svg>
  );
}
