import React from "react";

export function GalleryIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M8.5 6.5V6a2.5 2.5 0 0 1 2.5-2.5h7A2.5 2.5 0 0 1 20.5 6v7a2.5 2.5 0 0 1-2.5 2.5h-1.5"/>
  <rect x="3" y="6.5" width="15" height="14.5" rx="2.5"/>
  <circle cx="7.5" cy="10.5" r="1.3"/>
  <path d="m3.5 18.5 4.5-4.5 3 3 2-2 4.5 4.5"/>
    </svg>
  );
}
