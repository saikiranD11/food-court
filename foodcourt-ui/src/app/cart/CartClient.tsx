"use client";
import { api, Cart } from "@/lib/api";
import { getUserToken } from "@/lib/session";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const t = getUserToken();

  async function refresh() {
    setLoading(true);
    try {
      const c = await api.getCart(t);
      setCart(c);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  if (loading) return <div>Loading…</div>;
  if (!cart || cart.items.length === 0) return <div>Your cart is empty.</div>;

  return (
    <div className="space-y-4">
      <ul className="divide-y rounded-xl border">
        {cart.items.map(it => (
          <li key={it.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{it.item_name}</div>
              <div className="text-sm text-gray-600">Qty {it.qty} • ₹{it.price_each} ea</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">₹{it.line_total}</div>
              <button
                className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                onClick={async () => {
                  await api.removeFromCart(t, it.id);
                  await refresh();
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <div className="text-lg">Subtotal</div>
        <div className="text-xl font-semibold">₹{cart.subtotal}</div>
      </div>

      <button
        className="w-full rounded-lg bg-black px-4 py-3 text-white hover:opacity-90"
        onClick={async () => {
          const r = await api.checkout(t);
          // For MVP, redirect to order status page; (r.payment_link is stub)
          window.location.href = `/order/${r.order_id}`;
        }}
      >
        Checkout
      </button>

      <div className="text-sm text-gray-500">
        In MVP, we simulate payment. After you land on the order page, use the “Mark Paid (Dev)” button there.
      </div>
    </div>
  );
}
