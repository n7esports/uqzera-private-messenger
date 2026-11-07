import type { SVGProps } from "react";

export default function SolidSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M10 2h4l.7 2.8q.9.2 1.7.7L19 4l3 3-1.5 2.6q.5.8.7 1.7L22 12v2l-2.8.7q-.2.9-.7 1.7L20 19l-3 3-2.6-1.5q-.8.5-1.7.7L12 22h-2l-.7-2.8q-.9-.2-1.7-.7L5 20l-3-3 1.5-2.6q-.5-.8-.7-1.7L2 12v-2l2.8-.7q.2-.9.7-1.7L4 5l3-3 2.6 1.5q.8-.5 1.7-.7L12 2zm2 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
      />
    </svg>
  );
}
