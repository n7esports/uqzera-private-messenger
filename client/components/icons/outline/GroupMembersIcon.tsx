import React from "react";

export function GroupMembersIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="5.5" cy="10" r="1.9"/>
  <path d="M2.5 18.5a3.5 3.5 0 0 1 6 0"/>
  <circle cx="18.5" cy="10" r="1.9"/>
  <path d="M15.5 18.5a3.5 3.5 0 0 1 6 0"/>
  <circle cx="12" cy="8" r="2.6"/>
  <path d="M7 19a5 5 0 0 1 10 0"/>
    </svg>
  );
}
