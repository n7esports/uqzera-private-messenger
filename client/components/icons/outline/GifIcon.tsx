import React from "react";

export function GifIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <rect x="2.5" y="4.5" width="19" height="15" rx="3.5"/>
  <path d="M12 9.5H10a2.5 2.5 0 1 0 0 5h2v-2.5h-1.5"/>
  <path d="M13.5 9.5v5"/>
  <path d="M16 14.5v-5h3"/>
  <path d="M16 12h2.5"/>
    </svg>
  );
}
