import React from "react";

export function StickerIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M17 20.5H7.5a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4V14"/>
  <path d="M20.5 14h-3a3.5 3.5 0 0 0-3.5 3.5v3"/>
  <path d="M14 20.5c3.4-.3 6.2-3.1 6.5-6.5"/>
  <path d="M9 11a3 3 0 0 0 6 0"/>
  <path d="M9.5 9h.01"/>
  <path d="M13.5 9h.01"/>
    </svg>
  );
}
