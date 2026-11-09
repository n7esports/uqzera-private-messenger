import React from "react";

export function NotificationsIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M18 15.5H6c1.2-1.4 1.8-3.2 1.8-5.2V9a4.2 4.2 0 0 1 8.4 0v1.3c0 2 .6 3.8 1.8 5.2Z"/>
  <path d="M10 18.5a2.2 2.2 0 0 0 4 0"/>
  <circle cx="18.5" cy="5" r="2.2" fill="var(--uqzera-accent, #10B981)" stroke="none"/>
    </svg>
  );
}
