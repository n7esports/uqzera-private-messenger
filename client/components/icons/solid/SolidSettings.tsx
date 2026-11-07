import type { SVGProps } from "react";

export default function SolidSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M9.5 2h5l.6 2.2a8 8 0 0 1 1.9.8l2-1.1 3.5 3.5-1.1 2a8 8 0 0 1 .8 1.9l2.2.6v5l-2.2.6a8 8 0 0 1-.8 1.9l1.1 2-3.5 3.5-2-1.1a8 8 0 0 1-1.9.8L14.5 22h-5l-.6-2.2a8 8 0 0 1-1.9-.8l-2 1.1-3.5-3.5 1.1-2a8 8 0 0 1-.8-1.9L2.5 14.5v-5l2.2-.6a8 8 0 0 1 .8-1.9l-1.1-2 3.5-3.5 2 1.1a8 8 0 0 1 1.9-.8L9.5 2ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
      />
    </svg>
  );
}
