import React from "react";

export function SelectAllMessagesIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="3.5" y="3.5" width="13" height="13" rx="3"/>
  <rect x="7.5" y="7.5" width="13" height="13" rx="3"/>
  <path d="m10.5 14 2 2 4-4.5"/>
    </svg>
  );
}
