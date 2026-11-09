import React from "react";

export function BackupRestoreIcon({ size = 24, className, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M7 18.5h10.5a3.5 3.5 0 0 0 .6-6.95 5.5 5.5 0 0 0-10.6-2.1A4.2 4.2 0 0 0 7 18.5Z"/>
  <path d="M12 10.5v5"/>
  <path d="M9.5 13 12 15.5l2.5-2.5"/>
    </svg>
  );
}
