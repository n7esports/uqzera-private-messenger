import React from "react";

export function GroupsIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="16.5" cy="7.5" r="2.2"/>
  <path d="M13.5 14.5a4.5 4.5 0 0 1 8 0"/>
  <circle cx="9.5" cy="9" r="2.8"/>
  <path d="M4.5 19a5 5 0 0 1 10 0"/>
    </svg>
  );
}
