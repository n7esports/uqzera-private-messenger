import React from "react";

export function DeviceListIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="3.5" y="3.5" width="7" height="17" rx="2"/>
  <path d="M6 6h2"/>
  <path d="M6 17.5h2"/>
  <path d="M14 7h7"/>
  <path d="M14 12h7"/>
  <path d="M14 17h7"/>
    </svg>
  );
}
