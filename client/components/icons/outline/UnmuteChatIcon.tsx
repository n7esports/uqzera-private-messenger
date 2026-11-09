import React from "react";

export function UnmuteChatIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M15.5 15.5H5c1-1.2 1.5-2.8 1.5-4.5V9a3.7 3.7 0 0 1 7.4 0v2c0 1.7.5 3.3 1.5 4.5Z"/>
  <path d="M8.5 18.5a2 2 0 0 0 3.6 0"/>
  <path d="M17.5 9.5a2.5 2.5 0 0 1 0 5"/>
  <path d="M20 8.5a3.5 3.5 0 0 1 0 7"/>
    </svg>
  );
}
