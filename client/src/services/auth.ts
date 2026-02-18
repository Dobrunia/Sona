import { useAuthStore } from "@/stores/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql";

export async function refreshTokens() {
  const auth = useAuthStore();
  if (!auth.refreshToken) return null;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `mutation RefreshTokens($refreshToken: String!) {
        refreshTokens(refreshToken: $refreshToken) {
          accessToken
          refreshToken
          user { id email name avatar }
        }
      }`,
      variables: { refreshToken: auth.refreshToken }
    })
  });

  const json = await response.json();
  const payload = json?.data?.refreshTokens;
  if (!payload?.accessToken || !payload?.refreshToken) {
    return null;
  }

  auth.setSession(payload.accessToken, payload.refreshToken, payload.user ?? null);
  return payload.accessToken as string;
}
