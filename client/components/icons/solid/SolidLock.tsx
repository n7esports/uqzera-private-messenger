import type { SVGProps } from "react";
export default function SolidLock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path d="M6 10V8a6 6 0 0 1 12 0v2h-2V8a4 4 0 0 0-8 0v2z" />
      <path fillRule="evenodd" d="M5 10h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zm7 3a2 2 0 0 0-1 3.7V19h2v-2.3A2 2 0 0 0 12 13z" />
    </svg>
  );
}
