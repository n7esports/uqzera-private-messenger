import type { SVGProps } from "react";
export default function SolidNote(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M4 3h16v18H4V3zm3 8v1.5h8V11H7zm0 4v1.5h8V15H7zm7-12h1.2L20 7.8V9h-1.2L14 4.2V3z" />
    </svg>
  );
}
