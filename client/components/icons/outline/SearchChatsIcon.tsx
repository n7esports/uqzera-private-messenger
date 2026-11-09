import React from "react";

export function SearchChatsIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="2.5" y="5" width="12" height="5" rx="2.5"/>
  <rect x="2.5" y="12" width="9" height="5" rx="2.5"/>
  <circle cx="18.5" cy="18" r="3.5"/>
  <path d="m21 20.5 2 2"/>
    </svg>
  );
}
