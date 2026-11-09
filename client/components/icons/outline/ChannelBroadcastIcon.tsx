import React from "react";

export function ChannelBroadcastIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M12 20V9"/>
  <circle cx="12" cy="7" r="1.5"/>
  <path d="M9 20l3-7 3 7"/>
  <path d="M8.5 9a4.5 4.5 0 0 1 7 0"/>
  <path d="M6.5 7a6 6 0 0 1 11 0"/>
    </svg>
  );
}
