import type { SVGProps } from "react";
export default function SolidPaperclip(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M8 21a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v7a6 6 0 0 1-6 6H8zm0-4h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2z" />
    </svg>
  );
}
