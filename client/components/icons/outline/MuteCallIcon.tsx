import React from "react";

export function MuteCallIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="9" y="3.5" width="6" height="10" rx="3"/>
  <path d="M6.5 11a5.5 5.5 0 0 0 11 0"/>
  <path d="M12 16.5V20"/>
  <path d="M9 20h6"/>
  <path d="M4 4 20 20"/>
    </svg>
  );
}
