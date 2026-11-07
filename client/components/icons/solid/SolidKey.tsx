import type { SVGProps } from "react";
export default function SolidKey(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M10.2 6.2C8.4 4.4 5.6 4.4 3.8 6.2c-2.2 2.2-2.2 5.8 0 8C5.6 16 8.4 16 10.2 14.2L11.4 13H14v2.5h2.5v-3H18v3h3V9.5h-9.6c.4-1.2 0-2.4-1.2-3.3zM6.6 8.2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
    </svg>
  );
}
