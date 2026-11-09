import React from "react";

export function PinChatIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="2.5" y="6" width="11" height="5" rx="2.5"/>
  <rect x="2.5" y="13" width="8" height="5" rx="2.5"/>
  <path d="M15.5 5.5h5"/>
  <path d="M16.5 5.5v4.5l-2 3h7l-2-3V5.5"/>
  <path d="M18 13v6.5"/>
    </svg>
  );
}
