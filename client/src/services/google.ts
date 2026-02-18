import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import { apolloClient } from "@/plugins/apollo";
import { LOGIN_WITH_GOOGLE } from "@/graphql/mutations";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export async function initGoogleLogin(buttonId: string) {
  if (!CLIENT_ID) return;
  await loadGoogleScript();

  if (!window.google?.accounts?.id) return;

  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: async (response: { credential: string }) => {
      const auth = useAuthStore();
      const toast = useToastStore();

      try {
        const { data } = await apolloClient.mutate({
          mutation: LOGIN_WITH_GOOGLE,
          variables: { idToken: response.credential }
        });
        const payload = data?.loginWithGoogle;
        if (!payload) throw new Error("login failed");
        auth.setSession(payload.accessToken, payload.refreshToken, payload.user ?? null);
        toast.push("Вы вошли в аккаунт");
      } catch {
        toast.push("Не удалось войти", "error");
      }
    }
  });

  window.google.accounts.id.renderButton(document.getElementById(buttonId), {
    theme: "outline",
    size: "large",
    width: 260
  });
}
