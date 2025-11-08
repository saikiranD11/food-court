// Server Component (no "use client")
import OrderClient from "./OrderClient";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;         // ← unwrap the Promise
  const orderId = Number(id);
  return <OrderClient orderId={orderId} />;
}
