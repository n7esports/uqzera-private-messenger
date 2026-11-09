import React from "react";

export function VoiceNotePlayIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="8" cy="12" r="5"/>
  <path d="M6.8 9.6 10.5 12l-3.7 2.4V9.6Z" fill="currentColor" stroke="none"/>
  <path d="M15.5 9v6"/>
  <path d="M18 7v10"/>
  <path d="M20.5 10v4"/>
    </svg>
  );
}
