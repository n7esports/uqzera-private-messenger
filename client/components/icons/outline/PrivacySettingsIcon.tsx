import React from "react";

export function PrivacySettingsIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
  <path d="M8 9h8"/>
  <circle cx="10" cy="9" r="1.1" fill="currentColor" stroke="none"/>
  <path d="M8 13h8"/>
  <circle cx="14" cy="13" r="1.1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
