import React from "react";

export function SettingsProfileIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="8" cy="8.5" r="2.8"/>
  <path d="M3 19a5 5 0 0 1 10 0"/>
  <path d="M14 9h8"/>
  <circle cx="18" cy="9" r="1.4" fill="none" stroke="none"/>
  <path d="M14 15h8"/>
  <circle cx="16.5" cy="15" r="1.4" fill="none" stroke="none"/>
    </svg>
  );
}
