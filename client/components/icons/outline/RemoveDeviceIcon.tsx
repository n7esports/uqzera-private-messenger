import React from "react";

export function RemoveDeviceIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="2.5" y="4.5" width="11" height="8" rx="2"/>
  <path d="M1.5 15.5h13"/>
  <circle cx="18.5" cy="16.5" r="3.5"/>
  <path d="M17 16.5h3"/>
    </svg>
  );
}
