import React from "react";

export function ShareIdIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="2.5" y="8" width="12" height="9" rx="2.5"/>
  <path d="m6.5 11-.8 3.5"/>
  <path d="m9 11-.8 3.5"/>
  <path d="M5.5 12.2h4.5"/>
  <path d="M5.2 13.8h4.5"/>
  <path d="M15.5 8.5 21 3"/>
  <path d="M16.5 3H21v4.5"/>
    </svg>
  );
}
