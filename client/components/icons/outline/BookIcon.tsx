import React from "react";

export function BookIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M4 5.5C4 4.67 4.67 4 5.5 4H11a1 1 0 0 1 1 1v14a1 1 0 0 0-1-1H5.5A1.5 1.5 0 0 1 4 16.5z" />
      <path d="M20 5.5C20 4.67 19.33 4 18.5 4H13a1 1 0 0 0-1 1v14a1 1 0 0 1 1-1h5.5A1.5 1.5 0 0 0 20 16.5z" />
      <path d="M12 5v14" />
    </svg>
  );
}
