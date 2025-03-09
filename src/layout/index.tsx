import { useTheme, Bench } from "musae";
import { type ReactNode } from "react";
import Logo from "../components/logo";

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
          label: "任务列表",
          path: "/tasks",
        },
      ]}
      logo={<Logo />}
    >
      {children}
    </Bench>
  );
};

export default Layout;
