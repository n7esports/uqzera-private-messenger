import React from "react";
export function WifiOffIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className} {...props}>
      <path d="M12 20h.01" />
      <path d="M8.5 16.4a5 5 0 0 1 7 0" />
      <path d="M5 12.86a10 10 0 0 1 5.17-2.69" />
      <path d="M19 12.86a10 10 0 0 0-2.16-1.44" />
      <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
      <path d="M22 8.82a15 15 0 0 0-11.29-3.76" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}