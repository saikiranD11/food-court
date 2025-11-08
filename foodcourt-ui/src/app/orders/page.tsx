"use client";

import { useEffect, useState } from "react";
import { api, OrderHistory, OrderHistoryItem } from "@/lib/api";
import { getUserToken } from "@/lib/session";
import Link from "next/link";

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "paid" ? "bg-green-50 text-green-700 border-green-200" :
    status === "ready" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    status === "preparing" ? "bg-amber-50 text-amber-700 border-amber-200" :
    status === "completed" ? "bg-gray-100 text-gray-700 border-gray-200" :
    status === "cancelled" ? "bg-rose-50 text-rose-700 border-rose-200" :
    "bg-blue-50 text-blue-700 border-blue-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border p-4">
      <div className="h-5 w-32 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-48 rounded bg-gray-200" />
      <div className="mt-4 h-24 rounded bg-gray-100" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-6 w-24 rounded bg-gray-200" />
        <div className="h-9 w-28 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [data, setData] = useState<OrderHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const token = getUserToken();

  async function load() {
    setLoading(true);
    try {
      const h = await api.history(token);
      setData(h);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <h1 className="mb-2 text-2xl font-semibold">Your Orders</h1>
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  if (!data || data.orders.length === 0) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-semibold">Your Orders</h1>
        <div className="rounded-2xl border p-6 text-center text-gray-600">
          No orders yet. <Link href="/" className="text-blue-600 underline">Browse vendors</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Your Orders</h1>
      {data.orders.map((o) => <OrderCard key={o.order_id} o={o} onChanged={load} />)}
    </div>
  );
}

function OrderCard({ o, onChanged }: { o: OrderHistoryItem; onChanged: () => void }) {
  const dt = new Date(o.created_at);
  const pretty = dt.toLocaleString();

  return (
    <div className="rounded-2xl border p-4 shadow-sm hover:shadow transition">
      {/* Header: vendors (like Zomato restaurant chips) + status badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {o.vendors.map(v => (
            <span key={v} className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm">{v}</span>
          ))}
        </div>
        <StatusBadge status={o.status} />
      </div>

      {/* Subheader: date + payment id */}
      <div className="mt-1 text-sm text-gray-600">
        {pretty} {o.payment_id ? `• ${o.payment_id}` : ""}
      </div>

      {/* Lines list */}
      <ul className="mt-3 divide-y rounded-xl border bg-gray-50">
        {o.lines.map((l, i) => (
          <li key={i} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{l.item_name}</div>
              <div className="text-xs text-gray-600">{l.vendor_name} • Qty {l.qty}</div>
            </div>
            <div className="text-sm font-medium">₹{l.line_total}</div>
          </li>
        ))}
      </ul>

      {/* Footer: total + actions (View / Reorder) */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-lg font-semibold">Total: ₹{o.total_gross}</div>
        <div className="flex items-center gap-2">
          <Link
            href={`/order/${o.order_id}`}
            className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50"
          >
            View
          </Link>
          <ReorderButton o={o} onDone={onChanged} />
        </div>
      </div>
    </div>
  );
}

function ReorderButton({ o, onDone }: { o: OrderHistoryItem; onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      className="rounded-full bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          // add each line back to cart
          // Need menu_id to reorder exactly; we don't have it in history lines by design.
          // So we'll search menu by name within vendor via /catalog/menus?vendor_id=
          // Simple approach: fetch vendor menus and match by item name.
          // (If you want perfect mapping, we can include menu_id in the history API later.)
          for (const l of o.lines) {
            // get vendor id by name (quick fetch of all vendors, then menu list)
            const vendors = await api.vendors();
            const vendor = vendors.find(v => v.name === l.vendor_name);
            if (!vendor) continue;
            const menus = await api.menus(vendor.id);
            const match = menus.find(m => m.item_name === l.item_name);
            if (!match) continue;
            await api.addToCart(getUserToken(), match.id, l.qty);
          }
          onDone();
          window.location.href = "/cart";
        } catch (e) {
          alert((e as Error).message);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Adding..." : "Reorder"}
    </button>
  );
}
