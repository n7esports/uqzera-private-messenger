import type { SVGProps } from "react";
export default function SolidChat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path d="M4 4h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9l-5 5v-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}
