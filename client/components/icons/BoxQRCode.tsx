"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { KeyIcon as IconKey } from "./outline/KeyIcon";

export default function BoxQRCode({ payload, size = 256 }: { payload: string; size?: number }) {
  const [svgString, setSvgString] = useState<string | null>(null);

  useEffect(() => {
    if (!payload) return;
    QRCode.toString(payload, { type: "svg", width: size, margin: 1 }, (err, string) => {
      if (!err && string) {
        setSvgString(string);
      }
    });
  }, [payload, size]);

  if (!payload) return null;
  const circleSize = size * 0.28;

  return (
    <div className="relative inline-block overflow-hidden rounded-xl bg-white" style={{ width: size, height: size }}>
      {svgString ? (
        <div 
          className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full" 
          dangerouslySetInnerHTML={{ __html: svgString }} 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant">Generating QR...</div>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="flex items-center justify-center rounded-full bg-primary shadow-md border-2 border-white"
          style={{ width: circleSize, height: circleSize }}
        >
          <IconKey size={circleSize * 0.45} className="text-on-primary" />
        </div>
      </div>
    </div>
  );
}
