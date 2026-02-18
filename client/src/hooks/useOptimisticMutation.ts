import type { ApolloCache } from "@apollo/client/core";
import { useRefreshStore } from "@/stores/refresh";

export type RefreshKey = "tracks" | "favorites";

type OptimisticOptions<TData> = {
  optimisticResponse?: Record<string, unknown>;
  update?: (cache: ApolloCache<TData>, data?: TData | null) => void;
  refetchKeysOnError?: RefreshKey[];
};

export function useOptimisticMutation<TVars, TData>(
  mutate: (vars: TVars, options?: Record<string, unknown>) => Promise<{ data?: TData } | null>
) {
  const refresh = useRefreshStore();

  async function run(vars: TVars, options: OptimisticOptions<TData> = {}) {
    try {
      const result = await mutate(vars, {
        optimisticResponse: options.optimisticResponse,
        update: options.update
      });
      return result;
    } catch (error) {
      if (options.refetchKeysOnError) {
        for (const key of options.refetchKeysOnError) {
          if (key === "tracks") refresh.bumpTracks();
          if (key === "favorites") refresh.bumpFavorites();
        }
      }
      throw error;
    }
  }

  return { run };
}
