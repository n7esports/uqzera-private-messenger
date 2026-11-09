import React from "react";

export function SpeakerIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4a1.5 1.5 0 0 1-1.5-1.5v-2A1.5 1.5 0 0 1 4 9.5Z"/>
  <path d="M14.5 9a4.5 4.5 0 0 1 0 6"/>
  <path d="M17 6.5a8 8 0 0 1 0 11"/>
    </svg>
  );
}
