import React from "react";

export function ChangePassphraseIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="8" cy="8.5" r="3.2"/>
  <path d="m10.5 10.8 7.5 7.5"/>
  <path d="M15.5 15.8 18 13.3"/>
  <path d="M18 18.3l2.5-2.5"/>
  <path d="M16.5 8.5V6.7l3.5-3.5a1.2 1.2 0 0 1 1.7 0l.1.1a1.2 1.2 0 0 1 0 1.7l-3.5 3.5h-1.8Z"/>
    </svg>
  );
}
