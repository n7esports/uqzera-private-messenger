import React from "react";

export function GroupInfoIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="13.5" cy="6.5" r="1.8"/>
  <path d="M11 12a3.5 3.5 0 0 1 6.5 0"/>
  <circle cx="8" cy="8.5" r="2.4"/>
  <path d="M4 17a4.2 4.2 0 0 1 8 0"/>
  <circle cx="18.5" cy="17.5" r="3.5"/>
  <path d="M18.5 16.5h.01"/>
  <path d="M18.5 17.5v2"/>
    </svg>
  );
}
