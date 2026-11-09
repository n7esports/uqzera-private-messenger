import React from "react";

export function EndCallIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <g transform="scale(.85)">
  <path d="M5 6.5a2 2 0 0 1 2-2h1.2a1.5 1.5 0 0 1 1.5 1.2l.5 2.2a1.5 1.5 0 0 1-.8 1.6l-1.2.7a11.5 11.5 0 0 0 5.6 5.6l.7-1.2a1.5 1.5 0 0 1 1.6-.8l2.2.5a1.5 1.5 0 0 1 1.2 1.5v1.2a2 2 0 0 1-2 2C10.5 19.5 4.5 13.5 5 6.5Z"/>
  </g>
  <path d="m17 4 4 4"/>
  <path d="m21 4-4 4"/>
    </svg>
  );
}
