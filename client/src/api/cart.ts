import { api } from "./client";
import type { Cart } from "@/types";

/**
 * Every call returns the whole basket, so the caller never has to reconcile a
 * local copy with the server's. The basket is small and the round trip is
 * cheap; a stale badge in the header is not.
 */
export const cartApi = {
  async get(): Promise<Cart> {
    const { cart } = await api.get<{ cart: Cart }>("/cart");
    return cart;
  },
  async add(variantId: string, quantity = 1): Promise<Cart> {
    const { cart } = await api.post<{ cart: Cart }>("/cart/items", { variantId, quantity });
    return cart;
  },
  async setQuantity(itemId: string, quantity: number): Promise<Cart> {
    const { cart } = await api.patch<{ cart: Cart }>(`/cart/items/${itemId}`, { quantity });
    return cart;
  },
  async remove(itemId: string): Promise<Cart> {
    const { cart } = await api.delete<{ cart: Cart }>(`/cart/items/${itemId}`);
    return cart;
  },
};
