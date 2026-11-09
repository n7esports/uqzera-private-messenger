import React from "react";

export function PasskeyFingerprintIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M4.5 13a7.5 7.5 0 0 1 15 0v2.5c0 2.2-1 4.2-2.7 5.5"/>
  <path d="M7.5 13.5a4.5 4.5 0 0 1 9 0v2c0 1.6-.7 3-1.8 4"/>
  <path d="M10.2 14.5a1.8 1.8 0 0 1 3.6 0v1.2c0 1.1-.5 2.1-1.3 2.8"/>
  <path d="M12 9.8v2.5"/>
    </svg>
  );
}
