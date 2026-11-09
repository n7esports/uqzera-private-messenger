import React from "react";

export function EditBioIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
  <path d="M14 20.5v-1.8l4.8-4.8a1.4 1.4 0 0 1 2 0l.1.1a1.4 1.4 0 0 1 0 2l-4.8 4.8H14Z"/>
    </svg>
  );
}
