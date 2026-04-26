import { type ApplicationProps } from "@aiszlab/bee";
import Layout from "./layout";
import { ConfigProvider } from "musae";
import { zh_CN } from "musae/locales";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "./api";

const Application = ({ children }: ApplicationProps) => {
  return (
    <ConfigProvider locale={zh_CN}>
      <ApolloProvider client={client}>
        <Layout>{children}</Layout>
      </ApolloProvider>
    </ConfigProvider>
  );
};

export default Application;
