import React from "react";

export function ChannelsIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M3.5 9.5 17 4.5v15L3.5 14.5a2 2 0 0 1-1-1.8v-1.4a2 2 0 0 1 1-1.8Z"/>
  <path d="M6.5 15.5v2.5a1.5 1.5 0 0 0 3 0v-1.5"/>
    </svg>
  );
}
