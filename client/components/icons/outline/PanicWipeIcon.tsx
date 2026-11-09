import React from "react";

export function PanicWipeIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M12 3.5 5.5 6v5.5c0 4 2.7 6.9 6.5 8.5 3.8-1.6 6.5-4.5 6.5-8.5V6L12 3.5Z"/>
  <path d="M13 8 9.5 13H12l-1 4.5L15 12h-2.5L13 8Z" stroke="var(--uqzera-accent, #10B981)"/>
  <path d="M2.5 9h2"/>
  <path d="M2 13h2.5"/>
  <path d="M3.5 17h1.5"/>
    </svg>
  );
}
