import { defineStore } from "pinia";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
};

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
};

const ACCESS_KEY = "sona_access_token";
const REFRESH_KEY = "sona_refresh_token";
const USER_KEY = "sona_user";

function readUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: localStorage.getItem(ACCESS_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
    user: readUser()
  }),
  actions: {
    setSession(accessToken: string, refreshToken: string, user: AuthUser | null) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.user = user;
      localStorage.setItem(ACCESS_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    },
    clear() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
});
