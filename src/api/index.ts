import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { HttpLink, ApolloLink } from "@apollo/client";
import { AUTH_TOKENS, GRAPHQL_URL } from "../constants/api.constant";
import { SetContextLink } from "@apollo/client/link/context";
import { tryAuthenticate } from "../utils/auth.utils";

const client = new ApolloClient({
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache",
    },
  },

  cache: new InMemoryCache({}),

  link: ApolloLink.from([
    new SetContextLink(async (prevContext) => {
      const _authorization = prevContext.authorization;
      const _headers = new Headers(prevContext.headers);

      if (_headers.has(AUTH_TOKENS.AUTHORIZATION)) return prevContext;

      const _authenticated = _authorization || tryAuthenticate();
      if (!_authenticated) return prevContext;

      _headers.set(AUTH_TOKENS.AUTHORIZATION, `Bearer ${_authenticated}`);

      return {
        ...prevContext,
        headers: Object.fromEntries(_headers.entries()),
      };
    }),

    new ErrorLink(({ error }) => {
      const errorMessage = error.message;
      if (!errorMessage) return;

      import("musae")
        .then((_) => {
          _.Notification.error({
            title: "接口调用异常！",
            description: errorMessage,
          });
        })
        .catch(() => {
          console.error(errorMessage);
        });
    }),
    new HttpLink({
      uri: GRAPHQL_URL,
    }),
  ]),
});

export { client };
