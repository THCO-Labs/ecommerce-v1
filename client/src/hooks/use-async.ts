import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/api/client";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  /** Re-runs the loader — call it after a mutation instead of reloading the page. */
  reload: () => void;
}

/**
 * Replaces the `await` in the async server components this app was migrated
 * from: run a loader on mount (and whenever `deps` change) and expose the
 * three states every page renders — loading, error, data.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: readonly unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nonce, setNonce] = useState(0);

  // The loader closes over the caller's deps, which are the real inputs here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    run().then(
      (result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      },
      (cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof ApiError || cause instanceof Error ? cause.message : "Something went wrong.");
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [run, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);
  return { data, loading, error, reload };
}
