import React from "react";

export function OnlineStatusDotIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="12" cy="12" r="8" opacity=".32"/>
  <circle cx="12" cy="12" r="5.2" opacity=".62"/>
  <circle cx="12" cy="12" r="2.8" fill="var(--uqzera-accent, #10B981)" stroke="none"/>
    </svg>
  );
}
