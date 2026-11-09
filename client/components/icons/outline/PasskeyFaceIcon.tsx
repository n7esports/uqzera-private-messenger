import React from "react";

export function PasskeyFaceIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M4 9V6a2 2 0 0 1 2-2h3"/>
  <path d="M20 9V6a2 2 0 0 0-2-2h-3"/>
  <path d="M4 15v3a2 2 0 0 0 2 2h3"/>
  <path d="M20 15v3a2 2 0 0 1-2 2h-3"/>
  <path d="M9.5 10.5v1.5"/>
  <path d="M14.5 10.5v1.5"/>
  <path d="M12 12.5v1"/>
  <path d="M9 15a4 4 0 0 0 6 0"/>
    </svg>
  );
}
