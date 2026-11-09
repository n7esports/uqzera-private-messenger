import React from "react";

export function RemoveMemberIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="9" cy="8.5" r="3"/>
  <path d="M4 19a5 5 0 0 1 10 0"/>
  <path d="M15 12h7"/>
    </svg>
  );
}
