import React from "react";

export function EditMessageIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M4 6.5h11"/>
  <path d="M4 12h8"/>
  <path d="M4 17.5h6"/>
  <path d="M14 18v-2.2l4.8-4.8a1.5 1.5 0 0 1 2.1 0l.1.1a1.5 1.5 0 0 1 0 2.1L16.2 18H14Z"/>
  <path d="m17.6 12.4 2 2"/>
    </svg>
  );
}
