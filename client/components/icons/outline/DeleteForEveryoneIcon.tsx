import React from "react";

export function DeleteForEveryoneIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M3.5 6.5h10"/>
  <path d="M7 6.5V5a1.5 1.5 0 0 1 1.5-1.5h.5A1.5 1.5 0 0 1 10.5 5v1.5"/>
  <path d="m5 6.5.6 12a2 2 0 0 0 2 1.9h2.8a2 2 0 0 0 2-1.9l.6-12"/>
  <path d="M7.5 10v6.5"/>
  <path d="M10.5 10v6.5"/>
  <circle cx="18" cy="17" r="3.2"/>
  <path d="M14.8 17h6.4"/>
  <path d="M18 13.8c-1.6 1.8-1.6 4.6 0 6.4"/>
  <path d="M18 13.8c1.6 1.8 1.6 4.6 0 6.4"/>
    </svg>
  );
}
