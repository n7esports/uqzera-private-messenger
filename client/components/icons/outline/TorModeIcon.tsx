import React from "react";

export function TorModeIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="9" y="6" width="6" height="5" rx="1.5"/>
  <path d="M10.5 6V4.5a1.5 1.5 0 0 1 3 0V6"/>
  <path d="M9 11 5 18"/>
  <path d="M15 11l4 7"/>
  <path d="M5 18h14"/>
  <circle cx="5" cy="18" r="1.6"/>
  <circle cx="19" cy="18" r="1.6"/>
    </svg>
  );
}
