import React from "react";

export function ContactCardIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="2.5" y="5" width="19" height="14" rx="3"/>
  <circle cx="8.5" cy="10.5" r="2.2"/>
  <path d="M5.2 16.5a4.3 4.3 0 0 1 6.6 0"/>
  <path d="M13.5 10h5"/>
  <path d="M13.5 14h3.5"/>
    </svg>
  );
}
