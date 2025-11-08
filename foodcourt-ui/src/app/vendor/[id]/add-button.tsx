"use client";
import { api } from "@/lib/api";
import { getUserToken } from "@/lib/session";
import { useState } from "react";

export default function AddButton({ menuId }: { menuId: number }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          setLoading(true);
          setOk(false);
          await api.addToCart(getUserToken(), menuId, 1);
          setOk(true);
        } catch (e) {
          alert((e as Error).message);
        } finally {
          setLoading(false);
        }
      }}
      className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-60"
      disabled={loading}
    >
      {ok ? "Added ✓" : loading ? "Adding..." : "Add"}
    </button>
  );
}
