import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { HttpLink, ApolloLink } from "@apollo/client";
import { GRAPHQL_URL } from "../constants/api.constant";

const client = new ApolloClient({
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache",
    },
  },

  cache: new InMemoryCache({}),

  link: ApolloLink.from([
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
