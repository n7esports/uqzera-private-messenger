import type { SVGProps } from "react";
export default function SolidGlobe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM3.5 11.4h6.1c1-2.1 1.1-5.2 2.4-7.7 1.3 2.5 1.4 5.6 2.4 7.7h6.1v1.2h-6.1c-1 2.1-1.1 5.2-2.4 7.7-1.3-2.5-1.4-5.6-2.4-7.7H3.5v-1.2z" />
    </svg>
  );
}
