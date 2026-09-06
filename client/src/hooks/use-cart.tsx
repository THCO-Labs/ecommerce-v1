import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cartApi } from "@/api/cart";
import { ApiError } from "@/api/client";
import type { Cart } from "@/types";
import { useAuth } from "@/hooks/use-auth";

interface CartContextValue {
  cart: Cart;
  loading: boolean;
  /** The last basket error, e.g. adding something that just sold out. */
  error: string;
  add: (variantId: string, quantity?: number) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const EMPTY: Cart = { id: "", lines: [], itemCount: 0, subtotal: 0, hasShortfall: false };

const CartContext = createContext<CartContextValue | null>(null);

/**
 * The basket lives on the server, so this holds a copy rather than the truth.
 * Every mutation returns the whole basket and replaces that copy wholesale,
 * which is why the header badge, the basket page and checkout can never
 * disagree about what is in it.
 *
 * It lives in `hooks/` — a protected path — precisely because three different
 * pages read it. A shared module inside any one page's edit boundary would let
 * an edit aimed at that page silently change the other two.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, loading: authLoading } = useAuth();

  const refresh = useCallback(async () => {
    try {
      setCart(await cartApi.get());
    } catch {
      setCart(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Signing in merges the guest basket server-side, so the copy held here is
  // stale the moment the user changes. Re-read rather than guess the result.
  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, user?.id, refresh]);

  function run(operation: () => Promise<Cart>) {
    return async () => {
      setError("");
      try {
        setCart(await operation());
      } catch (cause) {
        setError(cause instanceof ApiError || cause instanceof Error ? cause.message : "Something went wrong.");
        // The server rejected the change, so re-read rather than leave the
        // basket showing something that was never applied.
        await refresh();
      }
    };
  }

  const add = useCallback(
    (variantId: string, quantity = 1) => run(() => cartApi.add(variantId, quantity))(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refresh],
  );
  const setQuantity = useCallback(
    (itemId: string, quantity: number) => run(() => cartApi.setQuantity(itemId, quantity))(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refresh],
  );
  const remove = useCallback(
    (itemId: string) => run(() => cartApi.remove(itemId))(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refresh],
  );

  const value = useMemo(
    () => ({ cart, loading, error, add, setQuantity, remove, refresh }),
    [cart, loading, error, add, setQuantity, remove, refresh],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
