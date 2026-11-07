import type { SVGProps } from "react";
export default function SolidShield(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path fillRule="evenodd" d="m12 2 8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3zm-2 13.2-3-3 1.4-1.4 1.6 1.6 5-5 1.4 1.4-6.4 6.4z" />
    </svg>
  );
}
