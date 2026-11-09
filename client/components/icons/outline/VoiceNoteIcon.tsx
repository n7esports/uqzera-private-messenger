import React from "react";

export function VoiceNoteIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M6 4h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-6.5L6 20v-4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/>
  <rect x="10.5" y="7" width="3" height="6" rx="1.5"/>
  <path d="M8.5 11.5a3.5 3.5 0 0 0 7 0"/>
  <path d="M12 15v2"/>
  <path d="M10 17.5h4"/>
    </svg>
  );
}
