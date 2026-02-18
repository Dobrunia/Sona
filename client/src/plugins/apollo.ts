import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client/core";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { fromPromise } from "@apollo/client/link/utils";
import { useAuthStore } from "@/stores/auth";
import { refreshTokens } from "@/services/auth";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql"
});

const authLink = setContext((_, { headers }) => {
  const authStore = useAuthStore();
  const token = authStore.accessToken;

  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
});

let refreshPromise: Promise<string | null> | null = null;

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (!graphQLErrors?.length) return;
  const isUnauth = graphQLErrors.some(
    (err) => err.extensions?.code === "UNAUTHENTICATED"
  );
  if (!isUnauth) return;

  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }

  return fromPromise(refreshPromise).flatMap((newToken) => {
    const authStore = useAuthStore();
    if (!newToken) {
      authStore.clear();
      return forward(operation);
    }

    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        Authorization: `Bearer ${newToken}`
      }
    }));

    return forward(operation);
  });
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache({
    typePolicies: {
      Track: {
        keyFields: ["id"]
      }
    }
  })
});

export const apolloClients = {
  default: apolloClient
};
