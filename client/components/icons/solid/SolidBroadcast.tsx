import type { SVGProps } from "react";
export default function SolidBroadcast(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
