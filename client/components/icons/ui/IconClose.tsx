import type { SVGProps } from "react";
export default function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" {...props}>
      <path d="M6 6l12 12-1.5 1.5L4.5 7.5 6 6zm12 0l1.5 1.5L7.5 19.5 6 18 18 6z" />
    </svg>
  );
}
