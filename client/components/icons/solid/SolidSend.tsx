import type { SVGProps } from "react";

export default function SolidSend(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path d="M2 2 L22 12 L2 22 L7 12 Z" />
    </svg>
  );
}
