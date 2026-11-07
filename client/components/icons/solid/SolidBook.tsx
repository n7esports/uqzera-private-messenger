import type { SVGProps } from "react";
export default function SolidBook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path d="M3 5.5c2.4-1.2 5.2-1.3 8-.5v14c-2.8-.8-5.6-.7-8 .5v-14zm18 0c-2.4-1.2-5.2-1.3-8-.5v14c2.8-.8 5.6-.7 8 .5v-14z" />
    </svg>
  );
}
