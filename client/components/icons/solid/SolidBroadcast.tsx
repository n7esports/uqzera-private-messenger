import type { SVGProps } from "react";
export default function SolidBroadcast(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M8.7 7.8c-1.9 2.3-1.9 6.1 0 8.4l1.4-1.4a4.7 4.7 0 0 1 0-5.6L8.7 7.8zM5.2 4.8C2.3 8.5 2.3 15.5 5.2 19.2l1.4-1.4a9.3 9.3 0 0 1 0-11.6L5.2 4.8zM15.3 7.8l-1.4 1.4a4.7 4.7 0 0 1 0 5.6l1.4 1.4c1.9-2.3 1.9-6.1 0-8.4zM18.8 4.8l-1.4 1.4a9.3 9.3 0 0 1 0 11.6l1.4 1.4c2.9-3.7 2.9-10.7 0-14.4z" />
    </svg>
  );
}
