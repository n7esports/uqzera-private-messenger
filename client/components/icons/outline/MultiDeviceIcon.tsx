import React from "react";

export function MultiDeviceIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="2.5" y="5" width="13" height="9" rx="2"/>
  <path d="M2 17h13.5"/>
  <rect x="16" y="10" width="5.5" height="10" rx="1.5"/>
  <path d="M18 12h1.5"/>
    </svg>
  );
}
