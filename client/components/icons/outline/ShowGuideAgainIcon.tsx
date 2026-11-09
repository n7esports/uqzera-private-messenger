import React from "react";

export function ShowGuideAgainIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M20 12a8 8 0 1 1-2.3-5.6"/>
  <path d="M20 4.5V9h-4.5"/>
  <path d="M9.8 10.2a2.2 2.2 0 1 1 3.3 1.9c-.7.4-1.1 1-1.1 1.8v.4"/>
  <path d="M12 17.2h.01"/>
    </svg>
  );
}
