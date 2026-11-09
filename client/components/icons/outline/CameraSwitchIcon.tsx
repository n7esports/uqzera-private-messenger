import React from "react";

export function CameraSwitchIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M4 9a8 8 0 0 1 13.5-2.5"/>
  <path d="M17.5 3.5v3.5H14"/>
  <path d="M20 15a8 8 0 0 1-13.5 2.5"/>
  <path d="M6.5 20.5V17H10"/>
  <circle cx="12" cy="12" r="3.2"/>
  <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
