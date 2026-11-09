import React from "react";

export function VideoCallIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="2.5" y="7" width="13" height="10" rx="3"/>
  <path d="M15.5 10.5 21.5 7.5v9l-6-3"/>
  <circle cx="7.5" cy="12" r="1.5"/>
    </svg>
  );
}
