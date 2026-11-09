import React from "react";

export function DisappearingTimerIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <circle cx="10" cy="12" r="7"/>
  <path d="M10 8v4l2.5 1.5"/>
  <circle cx="19" cy="8" r="1.2" fill="currentColor" stroke="none"/>
  <circle cx="21" cy="11.5" r="1" fill="currentColor" stroke="none" opacity=".55"/>
  <circle cx="19.5" cy="15" r=".8" fill="currentColor" stroke="none" opacity=".3"/>
    </svg>
  );
}
