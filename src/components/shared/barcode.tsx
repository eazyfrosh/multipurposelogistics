"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export function Barcode({ value, className }: { value: string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        width: 2,
        height: 56,
        displayValue: true,
        fontSize: 13,
        margin: 6,
        background: "transparent",
        lineColor: "currentColor",
      });
    } catch {
      // ignore invalid characters
    }
  }, [value]);

  return <svg ref={ref} className={className} />;
}
