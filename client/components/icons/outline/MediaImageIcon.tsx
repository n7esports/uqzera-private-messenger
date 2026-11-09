import React from "react";

export function MediaImageIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="3" y="4.5" width="18" height="15" rx="3"/>
  <circle cx="8.5" cy="9" r="1.6"/>
  <path d="m3.5 18.5 5.5-5.5 3.5 3.5 2.5-2.5 5 5"/>
    </svg>
  );
}
