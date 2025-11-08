"use client";
import { api, OrderStatus } from "@/lib/api";
import { useEffect, useState } from "react";

export default function OrderClient({ orderId }: { orderId: number }) {
  const [st, setSt] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const s = await api.orderStatus(orderId);
      setSt(s);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 3000);
    return () => clearInterval(iv);
  }, [orderId]);

  if (loading && !st) return <div>Loading…</div>;
  if (!st) return <div>Order not found.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Order #{st.order_id}</h1>
      <div className="rounded-xl border p-4">
        <div className="text-lg">
          Status: <span className="font-medium">{st.status}</span>
        </div>
        <div>Total: ₹{st.total_gross}</div>
      </div>

      {/* Dev helper for MVP (simulates payment webhook) */}
      <button
        className="rounded-lg border px-3 py-2 hover:bg-gray-50"
        onClick={async () => {
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/orders/${orderId}/mark-paid`, { method: "POST" });
          await refresh();
        }}
      >
        Mark Paid (Dev)
      </button>

      <div className="text-sm text-gray-500">
        In real flow, this updates automatically via a payment webhook.
      </div>
    </div>
  );
}
