"use client";
import { api, Cart } from "@/lib/api";
import { getUserToken } from "@/lib/session";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, AlertCircle } from "lucide-react";

export default function CartClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-gray-200 skeleton" />
        <div className="h-64 rounded-2xl bg-gray-200 skeleton" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mb-6 text-gray-600">Add some delicious items to get started!</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all"
          >
            Browse Vendors
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        <span className="text-sm text-gray-500">{cart.items.length} items</span>
      </div>

      {/* Cart Items */}
      <div className="space-y-3">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              {/* Item Image Placeholder */}
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 text-2xl">
                🍽️
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 font-semibold text-gray-900 truncate">
                  {item.item_name}
                </h3>
                <p className="mb-2 text-sm text-gray-600">₹{item.price_each} each</p>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      // For simplicity, remove if qty=1, else would need update endpoint
                      await api.removeFromCart(t, item.id);
                      await refresh();
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    {item.qty === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  </button>
                  <span className="w-8 text-center font-medium">{item.qty}</span>
                  <button
                    onClick={async () => {
                      await api.addToCart(t, item.menu_id, 1);
                      await refresh();
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Price & Remove */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-lg font-bold text-gray-900">₹{item.line_total}</div>
                <button
                  onClick={async () => {
                    await api.removeFromCart(t, item.id);
                    await refresh();
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Details */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Bill Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Item Total</span>
            <span>₹{cart.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>GST (5%)</span>
            <span>₹{(parseFloat(cart.subtotal.toString()) * 0.05).toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>To Pay</span>
              <span>₹{(parseFloat(cart.subtotal.toString()) * 1.05).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dev Note */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-900">MVP Demo Mode</p>
          <p className="text-amber-700">
            Payment is simulated. After checkout, use the "Mark Paid (Dev)" button on the order page.
          </p>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={async () => {
          setCheckingOut(true);
          try {
            const r = await api.checkout(t);
            window.location.href = `/order/${r.order_id}`;
          } catch (e) {
            alert((e as Error).message);
            setCheckingOut(false);
          }
        }}
        disabled={checkingOut}
        className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
      >
        {checkingOut ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            Proceed to Checkout
            <ArrowRight className="h-5 w-5" />
          </div>
        )}
      </button>
    </div>
  );
}