"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, DollarSign, TrendingUp } from "lucide-react";
import { vendorApi } from "@/lib/api";

function VendorDashboardContent({ vendorId }: { vendorId: number }) {
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") || "orders") as "orders" | "menu" | "analytics";

  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newItem, setNewItem] = useState({ item_name: "", price: "", category: "Pizza", is_active: true });
  const [editingPrice, setEditingPrice] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (tab === "orders") loadOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [vendorId, tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStats(), loadOrders(), loadMenu()]);
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await vendorApi.getStats(vendorId);
      setStats(data);
    } catch (e) {
      console.error("Error loading stats:", e);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await vendorApi.getOrders(vendorId);
      setOrders(data);
    } catch (e) {
      console.error("Error loading orders:", e);
    }
  };

  const loadMenu = async () => {
    try {
      const data = await vendorApi.getMenu(vendorId);
      setMenuItems(data);
    } catch (e) {
      console.error("Error loading menu:", e);
    }
  };

  const handleAddMenuItem = async () => {
    if (!newItem.item_name || !newItem.price) {
      alert("Please fill in all fields");
      return;
    }
    try {
      await vendorApi.addMenuItem(vendorId, {
        item_name: newItem.item_name,
        price: parseFloat(newItem.price),
        category: newItem.category,
        is_active: newItem.is_active,
      });
      setNewItem({ item_name: "", price: "", category: "Pizza", is_active: true });
      setShowAddMenu(false);
      await loadMenu();
    } catch (e) {
      alert("Error adding menu item: " + (e as Error).message);
    }
  };

  const handleUpdatePrice = async (menuId: number) => {
    if (!newPrice) {
      alert("Please enter a price");
      return;
    }
    try {
      await vendorApi.updateMenuPrice(vendorId, menuId, parseFloat(newPrice));
      setEditingPrice(null);
      setNewPrice("");
      await loadMenu();
    } catch (e) {
      alert("Error updating price: " + (e as Error).message);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await vendorApi.updateOrderStatus(vendorId, orderId, newStatus);
      await loadOrders();
    } catch (e) {
      alert("Error updating order: " + (e as Error).message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: "bg-red-100 text-red-700 border-red-300",
      pending: "bg-red-100 text-red-700 border-red-300",
      preparing: "bg-amber-100 text-amber-700 border-amber-300",
      ready: "bg-green-100 text-green-700 border-green-300",
      completed: "bg-blue-100 text-blue-700 border-blue-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getNextStatus = (status: string) => {
    const flow: Record<string, string> = {
      created: "preparing",
      preparing: "ready",
      ready: "completed",
      pending: "preparing",
    };
    return flow[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
        <h2 className="text-3xl font-bold text-gray-800">
          {tab === "orders" && "📦 Live Orders"}
          {tab === "menu" && "🍽️ Menu & Pricing"}
          {tab === "analytics" && "📊 Analytics"}
        </h2>
      </div>

      {/* Content */}
      <div className="p-8">
        {tab === "orders" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats?.pending_orders || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-amber-500">
                <p className="text-gray-600 text-sm font-medium">Total Orders Today</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{stats?.total_orders || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                <p className="text-gray-600 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">₹{stats?.revenue || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.completed_orders || 0}</p>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 font-semibold text-lg">
                Active Orders
              </div>
              {orders.length === 0 ? (
                <div className="p-6 text-center text-gray-600">No active orders</div>
              ) : (
                <div className="divide-y">
                  {orders.map((order) => (
                    <div key={order.order_id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg">Order #{order.order_id}</p>
                          <p className="text-gray-600">₹{order.total_gross}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mb-3">
                        {order.items.map((item: any, i: number) => (
                          <p key={i} className="text-sm text-gray-600">
                            {item.name} x{item.qty}
                          </p>
                        ))}
                      </div>
                      {order.status !== "completed" && (
                        <button
                          onClick={() => handleUpdateStatus(order.order_id, getNextStatus(order.status))}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium transition"
                        >
                          Mark as {getNextStatus(order.status)}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "menu" && (
          <div className="space-y-6">
            <button
              onClick={() => setShowAddMenu(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + Add Item
            </button>

            {showAddMenu && (
              <div className="bg-white p-6 rounded-lg shadow border-2 border-orange-300">
                <h3 className="text-lg font-bold mb-4">Add New Menu Item</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={newItem.item_name}
                    onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option>Pizza</option>
                    <option>Biryani</option>
                    <option>Chaat</option>
                    <option>Beverages</option>
                  </select>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddMenuItem}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                    >
                      Add Item
                    </button>
                    <button
                      onClick={() => setShowAddMenu(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.length === 0 ? (
                <div className="col-span-3 bg-white p-8 rounded-lg text-center text-gray-600">
                  No menu items. Add one to get started.
                </div>
              ) : (
                menuItems.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <h4 className="font-bold text-lg mb-2">{item.item_name}</h4>
                    <p className="text-2xl font-bold text-orange-600 mb-3">₹{item.price}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.is_active}
                          className="w-4 h-4"
                          onChange={(e) => vendorApi.toggleMenuAvailability(vendorId, item.id, e.target.checked).then(loadMenu)}
                        />
                        <span className="text-sm">{item.is_active ? "Available" : "Out of Stock"}</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      {editingPrice === item.id ? (
                        <div className="flex gap-2 w-full">
                          <input
                            type="number"
                            placeholder="New price"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-2 py-1"
                          />
                          <button
                            onClick={() => handleUpdatePrice(item.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingPrice(item.id);
                              setNewPrice(item.price.toString());
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition"
                          >
                            Edit Price
                          </button>
                          <button
                            onClick={() => vendorApi.deleteMenuItem(vendorId, item.id).then(loadMenu)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold mb-4">Revenue Today</h4>
              <p className="text-3xl font-bold text-green-600">₹{stats?.revenue || 0}</p>
              <p className="text-gray-600 mt-2">{stats?.total_orders || 0} orders completed</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold mb-4">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <p>Total Menu Items: <span className="font-bold">{stats?.menu_items || 0}</span></p>
                <p>Today's Orders: <span className="font-bold">{stats?.total_orders || 0}</span></p>
                <p>Completed: <span className="font-bold text-green-600">{stats?.completed_orders || 0}</span></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VendorDashboardPage({
  params,
}: {
  params: { id: string };
}) {
  const vendorId = Number(params.id);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VendorDashboardContent vendorId={vendorId} />
    </Suspense>
  );
}
