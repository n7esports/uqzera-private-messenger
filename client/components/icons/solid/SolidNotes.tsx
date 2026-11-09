import type { SVGProps } from "react";
export default function SolidNotes(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M4 3h16v18H4V3zm3 7v1.5h8V10H7zm0 4v1.5h8V14H7zm0 4v1.5h6V18H7zm7-15h1.2L20 7.8V9h-1.2L14 4.2V3z" />
    </svg>
  );
}
