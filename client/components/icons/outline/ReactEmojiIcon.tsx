import React from "react";

export function ReactEmojiIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="10.5" cy="12" r="7.5"/>
  <path d="M7.5 13.8a4 4 0 0 0 6 0"/>
  <path d="M8.3 9.6h.01"/>
  <path d="M12.7 9.6h.01"/>
  <path d="M19 3.5v4"/>
  <path d="M17 5.5h4"/>
    </svg>
  );
}
