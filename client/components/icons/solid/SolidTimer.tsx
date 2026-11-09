import type { SVGProps } from "react";
export default function SolidTimer(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path d="M10 2h4v2h-4zM11 4h2v2h-2z" />
      <path fillRule="evenodd" d="M12 4a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm-.8 4h1.6v4.6l3.2 2.1-.9 1.4-3.9-2.7V8z" />
    </svg>
  );
}
