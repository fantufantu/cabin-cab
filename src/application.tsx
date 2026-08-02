import { type ApplicationProps } from "@aiszlab/bee";
import AppLayout from "./layout/app.layout";
import { ConfigProvider, ThemeProvider } from "musae";
import { zh_CN } from "musae/locales";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "./api";
import { useMount, useRequest } from "@aiszlab/relax";
import { useAuthStore } from "./stores/auth.store";
import { useThemeStore } from "./stores/theme.store";

const Application = ({ children }: ApplicationProps) => {
  const { whoAmI } = useAuthStore();
  const { mode, init } = useThemeStore();

  useRequest(whoAmI, { auto: true });

  useMount(() => {
    init();
  });

  if (!mode) {
    return null;
  }

  return (
    <ConfigProvider locale={zh_CN}>
      <ThemeProvider defaultMode={mode}>
        <ApolloProvider client={client}>
          <AppLayout>{children}</AppLayout>
        </ApolloProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default Application;
