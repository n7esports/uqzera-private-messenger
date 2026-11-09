import type { SVGProps } from "react";
export default function SolidTrash(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path d="M9 2h6l1 2h5v2H3V4h5l1-2zM5 7h14l-1 14H6L5 7z" />
      <path d="M8 10h2v8H8zM14 10h2v8h-2z" />
    </svg>
  );
}
