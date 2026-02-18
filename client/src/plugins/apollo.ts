import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client/core";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
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

  return new Promise((resolve) => {
    refreshPromise?.then((newToken) => {
      const authStore = useAuthStore();
      if (!newToken) {
        authStore.clear();
        return resolve(forward(operation));
      }

      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`
        }
      }));

      resolve(forward(operation));
    });
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
