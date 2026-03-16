import { type ApplicationProps } from "@aiszlab/bee";
import Layout from "./layout";
import { ConfigProvider } from "musae";
import { zh_CN } from "musae/locales";

const Application = ({ children }: ApplicationProps) => {
  return (
    <ConfigProvider locale={zh_CN}>
      <Layout>{children}</Layout>
    </ConfigProvider>
  );
};

export default Application;
