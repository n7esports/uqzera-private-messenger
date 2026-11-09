import React from "react";

export function BlueTicksDeliveredIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="m3 12.5 3.5 3.5L14 8.5" stroke="var(--uqzera-accent, #10B981)"/>
  <path d="m9.5 12.5 3.5 3.5L21.5 7.5" stroke="var(--uqzera-accent, #10B981)"/>
    </svg>
  );
}
