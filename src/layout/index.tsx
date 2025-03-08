import { useTheme, Bench } from "musae";
import { createContext, type ReactNode } from "react";
import Logo from "../components/logo";
import { LazyStore } from "@tauri-apps/plugin-store";
import { Nullable } from "@aiszlab/relax/types";

const tasksStore = new LazyStore("tasks.json");

const Context = createContext<{ tasksStore: Nullable<LazyStore> }>({ tasksStore: null });

const Layout = ({ children }: { children: ReactNode }) => {
  const { colors } = useTheme();

  return (
    <Context.Provider value={{ tasksStore }}>
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
    </Context.Provider>
  );
};

export default Layout;
