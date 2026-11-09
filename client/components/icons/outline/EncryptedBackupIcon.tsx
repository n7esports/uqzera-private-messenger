import React from "react";

export function EncryptedBackupIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M7 18.5h10.5a3.5 3.5 0 0 0 .6-6.95 5.5 5.5 0 0 0-10.6-2.1A4.2 4.2 0 0 0 7 18.5Z"/>
  <rect x="9.5" y="12.5" width="5" height="4" rx="1"/>
  <path d="M10.5 12.5v-1a1.5 1.5 0 0 1 3 0v1"/>
    </svg>
  );
}
