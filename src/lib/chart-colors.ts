"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Fixed-order categorical palette (dataviz skill reference palette). Never cycle/reassign per-render. */
const CATEGORICAL_LIGHT = ["#2a78d6", "#008300", "#e87ba4", "#eda100", "#1baf7a", "#eb6834", "#4a3aa7", "#e34948"];
const CATEGORICAL_DARK = ["#3987e5", "#008300", "#d55181", "#c98500", "#199e70", "#d95926", "#9085e9", "#e66767"];

const SEQUENTIAL_BLUE_LIGHT = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95"];
const SEQUENTIAL_BLUE_DARK = ["#184f95", "#256abf", "#3987e5", "#6da7ec", "#9ec5f4", "#cde2fb"];

export const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};

export const CHART_INK = {
  light: { primary: "#0b0b0b", secondary: "#52514e", muted: "#898781", grid: "#e1e0d9" },
  dark: { primary: "#ffffff", secondary: "#c3c2b7", muted: "#898781", grid: "#2c2c2a" },
};

export function useChartPalette() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  return {
    categorical: isDark ? CATEGORICAL_DARK : CATEGORICAL_LIGHT,
    sequential: isDark ? SEQUENTIAL_BLUE_DARK : SEQUENTIAL_BLUE_LIGHT,
    ink: isDark ? CHART_INK.dark : CHART_INK.light,
    isDark,
  };
}
