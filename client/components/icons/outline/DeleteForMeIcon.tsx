import React from "react";

export function DeleteForMeIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M4 6.5h11"/>
  <path d="M7.5 6.5V5A1.5 1.5 0 0 1 9 3.5h1A1.5 1.5 0 0 1 11.5 5v1.5"/>
  <path d="m5.5 6.5.7 12a2 2 0 0 0 2 1.9h3.6a2 2 0 0 0 2-1.9l.7-12"/>
  <path d="M8.5 10v6.5"/>
  <path d="M11.5 10v6.5"/>
  <circle cx="18.5" cy="15" r="1.6"/>
  <path d="M15.8 20.5a3 3 0 0 1 5.4 0"/>
    </svg>
  );
}
