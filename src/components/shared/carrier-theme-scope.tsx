import type { CSSProperties, ReactNode } from "react";
import { getCarrierTheme } from "@/lib/data/carrier-themes";
import { cn } from "@/lib/utils";

interface CarrierThemeScopeProps {
  carrierCode: string;
  className?: string;
  children: ReactNode;
}

/**
 * Publishes a carrier's theme as CSS custom properties on a wrapper element.
 * Every themed component reads --carrier-primary/secondary/on-primary/
 * on-secondary (declared with app-default fallbacks in globals.css), so
 * anything themed still renders correctly outside this scope. The `.carrier-theme`
 * class (globals.css) transitions those properties smoothly when they change,
 * e.g. navigating between shipments from different carriers.
 */
export function CarrierThemeScope({ carrierCode, className, children }: CarrierThemeScopeProps) {
  const theme = getCarrierTheme(carrierCode);
  const style = {
    "--carrier-primary": theme.primary,
    "--carrier-secondary": theme.secondary,
    "--carrier-on-primary": theme.onPrimary,
    "--carrier-on-secondary": theme.onSecondary,
  } as CSSProperties;

  return (
    <div data-carrier={carrierCode} className={cn("carrier-theme", className)} style={style}>
      {children}
    </div>
  );
}
