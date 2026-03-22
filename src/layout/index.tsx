import { useTheme } from "musae";
import { type ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        "--color-surface-container-low": colors["surface-container-low"],
        "--color-primary": colors["primary"],
        "--color-on-primary": colors["on-primary"],
        "--color-on-primary-20": "color-mix(in srgb, var(--color-on-primary) 20%, transparent)",
        "--color-secondary": colors["secondary"],
        "--color-on-secondary": colors["on-secondary"],
        "--color-outline": colors["outline"],
        "--color-success": colors["success"],
        "--color-success-20": "color-mix(in srgb, var(--color-success) 20%, transparent)",
        "--color-success-80": "color-mix(in srgb, var(--color-success) 80%, transparent)",
      }}
    >
      {children}
    </div>
  );
};

export default Layout;
