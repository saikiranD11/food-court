import Link from "next/link";
import { api, Vendor } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getVendors(): Promise<Vendor[]> {
  return api.vendors();
}

export default async function Home() {
  const vendors = await getVendors();
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Vendors</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {vendors.map(v => (
          <Link key={v.id} href={`/vendor/${v.id}`} className="rounded-xl border p-4 hover:shadow">
            <div className="text-lg font-medium">{v.name}</div>
            <div className="text-sm text-gray-500">Stall {v.stall_no ?? "—"}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
