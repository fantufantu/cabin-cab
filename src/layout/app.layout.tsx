import { useTheme } from "musae";
import { type ReactNode } from "react";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { colors } = useTheme();

  return (
    <div
      className="min-h-screen"
      style={{
        "--color-surface-container-low": colors["surface-container-low"],
        "--color-surface-container-high": colors["surface-container-high"],
        "--color-surface-container-highest": colors["surface-container-highest"],
        "--color-on-surface": colors["on-surface"],
        "--color-primary": colors["primary"],
        "--color-on-primary": colors["on-primary"],
        "--color-on-primary-20": "color-mix(in srgb, var(--color-on-primary) 20%, transparent)",
        "--color-secondary": colors["secondary"],
        "--color-on-secondary": colors["on-secondary"],
        "--color-outline": colors["outline"],
        "--color-success": colors["success"],
        "--color-success-20": "color-mix(in srgb, var(--color-success) 20%, transparent)",
        "--color-success-80": "color-mix(in srgb, var(--color-success) 80%, transparent)",
        "--color-on-surface-variant": colors["on-surface-variant"],
        "--color-outline-variant": colors["outline-variant"],
        "--color-primary-container": colors["primary-container"],
        "--color-surface": colors["surface"],
        "--color-tertiary": colors["tertiary"],
        "--color-tertiary-container": colors["tertiary-container"],
        "--color-error": colors["error"],
        "--color-on-error": colors["on-error"],
      }}
    >
      {children}
    </div>
  );
};

export default AppLayout;
