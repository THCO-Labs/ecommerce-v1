import { api } from "./client";
import type { DashboardMetrics, OrderDetail, OrderStatus, OrderSummary } from "@/types";

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  notes?: string;
}

export const ordersApi = {
  async checkout(input: CheckoutInput): Promise<OrderDetail> {
    return api.post<OrderDetail>("/orders", input);
  },
  /** Reference plus email is the guest's credential; a miss returns null. */
  async lookup(reference: string, email: string): Promise<OrderDetail | null> {
    const { order } = await api.get<{ order: OrderDetail | null }>("/orders/lookup", { reference, email });
    return order;
  },
  /** Redacted — enough to confirm the order exists, not enough to be worth guessing. */
  async summary(reference: string): Promise<OrderSummary> {
    const { summary } = await api.get<{ summary: OrderSummary }>(`/orders/${reference}/summary`);
    return summary;
  },
  async mine(): Promise<OrderDetail[]> {
    const { orders } = await api.get<{ orders: OrderDetail[] }>("/orders/me");
    return orders;
  },

  // --- staff and admin ---
  async list(): Promise<OrderDetail[]> {
    const { orders } = await api.get<{ orders: OrderDetail[] }>("/orders");
    return orders;
  },
  async setStatus(orderId: string, status: OrderStatus) {
    return api.patch<{ order: OrderDetail["order"] }>(`/orders/${orderId}/status`, { status });
  },
  async metrics(): Promise<DashboardMetrics> {
    const { metrics } = await api.get<{ metrics: DashboardMetrics }>("/orders/metrics");
    return metrics;
  },
};
