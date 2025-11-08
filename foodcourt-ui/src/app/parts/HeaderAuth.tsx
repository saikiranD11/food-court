"use client";
import Link from "next/link";
import { getProfile, logout } from "@/lib/auth";
import { useEffect, useState } from "react";

export function HeaderAuth() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const p = getProfile();
    setName(p?.display_name || p?.email || null);
  }, []);

  if (!name) {
    return <Link className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50" href="/login">Login</Link>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-sm text-gray-700">Hi, {name.split("@")[0]}</span>
      <button
        className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
        onClick={() => { logout(); window.location.reload(); }}
      >
        Logout
      </button>
    </div>
  );
}
