// Server Component (no "use client")
import { api, Menu } from "@/lib/api";
import AddButton from "./add-button";

export const dynamic = "force-dynamic";

async function getMenu(vendorId: number): Promise<Menu[]> {
  return api.menus(vendorId);
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;            // ← unwrap the Promise
  const vendorId = Number(id);
  if (!Number.isFinite(vendorId)) {
    return <div>Invalid vendor id.</div>;
  }

  const items = await getMenu(vendorId);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Menu</h1>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <div className="font-medium">{i.item_name}</div>
              <div className="text-sm text-gray-600">₹{i.price}</div>
            </div>
            <AddButton menuId={i.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
