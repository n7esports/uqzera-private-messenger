import React from "react";

export function QrShareIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="3.5" y="6.5" width="12" height="12" rx="2.5"/>
  <circle cx="7" cy="10" r="1.2" fill="currentColor" stroke="none"/>
  <circle cx="12" cy="10" r="1.2" fill="currentColor" stroke="none"/>
  <circle cx="7" cy="15" r="1.2" fill="currentColor" stroke="none"/>
  <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none"/>
  <path d="M15.5 8.5 21 3"/>
  <path d="M16.5 3H21v4.5"/>
    </svg>
  );
}
