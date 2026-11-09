import React from "react";
export function KeyIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className} {...props}>
      <circle cx="7.5" cy="15" r="5.5" />
      <path d="m21 3-9.5 9.5" />
      <path d="m18 6 3 3" />
      <path d="m15 9 3 3" />
    </svg>
  );
}