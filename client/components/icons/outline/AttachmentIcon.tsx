import React from "react";

export function AttachmentIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M19.5 10.5 11 19a4 4 0 0 1-5.7-5.7l8.6-8.6a2.8 2.8 0 0 1 4 4l-8.6 8.6a1.4 1.4 0 0 1-2-2l7.8-7.8"/>
    </svg>
  );
}
