import { useTheme } from "musae";
import { type ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const { colors } = useTheme();

  return (
    <div
      style={{
        "--color-surface-container-low": colors["surface-container-low"],
        "--color-on-primary": colors["on-primary"],
      }}
    >
      {children}
    </div>
  );
};

export default Layout;
