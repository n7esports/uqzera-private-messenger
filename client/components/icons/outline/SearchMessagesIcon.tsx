import React from "react";

export function SearchMessagesIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M5 4h9a2.5 2.5 0 0 1 2.5 2.5v4.5a2.5 2.5 0 0 1-2.5 2.5H8l-3.5 3v-3H4a2.5 2.5 0 0 1-2.5-2.5V6.5A2.5 2.5 0 0 1 4 4Z"/>
  <circle cx="18.5" cy="18" r="3.5"/>
  <path d="m21 20.5 2 2"/>
    </svg>
  );
}
