import { useTheme, Bench } from "musae";
import Navigations from "../components/navigations";
import { type ReactNode } from "react";
import Logo from "../components/navigations/logo";

const Layout = ({ children }: { children: ReactNode }) => {
  const { colors } = useTheme();

  return (
    <Bench
      style={{
        // @ts-expect-error style vars
        "--color-surface-container-low": colors["surface-container-low"],
        "--color-on-primary": colors["on-primary"],
      }}
      title="Cabin-Cab"
      layout="side"
      navigations={[
        {
          label: "测试",
          path: "/task",
          children: [
            {
              label: "child1",
              path: "/task/child1",
            },
          ],
        },
        {
          label: "测试2",
          path: "/task2",
        },
      ]}
      logo={<Logo />}
    >
      {children}
    </Bench>
  );
};

export default Layout;
