import { type ApplicationProps } from "@aiszlab/bee";
import Layout from "./layout";
import { TaskStore } from "./stores/task";
import TaskContext from "./contexts/task";
import { useDefault } from "@aiszlab/relax";
import { ConfigProvider } from "musae";
import { zh_CN } from "musae/locales";

const Application = ({ children }: ApplicationProps) => {
  const contextValue = useDefault(() => {
    return {
      taskStore: new TaskStore(),
    };
  });

  return (
    <TaskContext.Provider value={contextValue}>
      <ConfigProvider locale={zh_CN}>
        <Layout>{children}</Layout>
      </ConfigProvider>
    </TaskContext.Provider>
  );
};

export default Application;
