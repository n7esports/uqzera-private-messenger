import React from "react";

export function GroupAdminIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="8.5" cy="8.5" r="2.8"/>
  <path d="M3.5 19a5 5 0 0 1 10 0"/>
  <path d="M17.5 8.5l5 2v3.2c0 2.6-2 4.5-5 5.8-3-1.3-5-3.2-5-5.8V10.5l5-2Z"/>
  <path d="m15.3 14.5 1.5 1.5 2.9-3"/>
    </svg>
  );
}
