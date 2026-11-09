import React from "react";

export function CopyIdIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M17 7V5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17H7"/>
  <rect x="7" y="7" width="14" height="14" rx="3"/>
  <path d="m11.5 11-.8 5"/>
  <path d="m15.5 11-.8 5"/>
  <path d="M10 13h6"/>
  <path d="M9.5 15h6"/>
    </svg>
  );
}
