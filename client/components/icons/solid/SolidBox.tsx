import type { SVGProps } from "react";
export default function SolidBox(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M4 8h16v12H4V8zm5 3v2h6v-2H9z" />
      <path d="M3 5h18v4H3V5z" />
    </svg>
  );
}
