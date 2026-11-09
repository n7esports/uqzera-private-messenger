import React from "react";

export function VoiceNoteWaveformIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M4 9.5v5"/>
  <path d="M8 6.5v11"/>
  <path d="M12 3.5v17"/>
  <path d="M16 7.5v9"/>
  <path d="M20 10v4"/>
    </svg>
  );
}
