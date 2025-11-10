// foodcourt-ui/src/app/vendor-portal/[id]/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X, LogOut, Clock, DollarSign, TrendingUp, Home } from "lucide-react";

export default function VendorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const vendorId = params.id;
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "orders";

  const navItems = [
    { id: "orders", icon: Clock, label: "Orders", path: `?tab=orders` },
    { id: "menu", icon: DollarSign, label: "Menu", path: `?tab=menu` },
    { id: "analytics", icon: TrendingUp, label: "Analytics", path: `?tab=analytics` },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-20"} 
          bg-gradient-to-b from-orange-600 to-orange-700 
          text-white 
          transition-all duration-300 
          shadow-lg 
          flex flex-col
          fixed h-screen left-0 top-0 z-40
        `}
      >
        {/* Logo/Header */}
        <div className="p-4 border-b border-orange-500 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-lg">
                <span className="text-lg font-bold">🍕</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">FoodCourt</h1>
                <p className="text-xs text-orange-200">Vendor Portal</p>
              </div>
            </div>
          ) : (
            <span className="text-2xl">🍕</span>
          )}

          <button
            onClick={toggleSidebar}
            className="hover:bg-orange-700 p-2 rounded-lg transition-colors duration-200 ml-auto"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-2 px-4 flex-1">
          {navItems.map(({ id, icon: Icon, label, path }) => (
            <Link
              key={id}
              href={`/vendor-portal/${vendorId}${path}`}
              className={`
                flex items-center gap-3 
                px-4 py-3 
                rounded-lg 
                transition-colors duration-200
                ${
                  currentTab === id
                    ? "bg-orange-500 text-white"
                    : "hover:bg-orange-500 text-orange-100"
                }
              `}
            >
              <Icon size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="px-4 mb-4">
          <div className="h-px bg-orange-500"></div>
        </div>

        {/* Footer Links */}
        <div className="px-4 space-y-2 mb-4">
          <Link
            href="/vendor-portal"
            className="
              flex items-center gap-3 
              px-4 py-3 
              rounded-lg 
              hover:bg-orange-500 
              transition-colors duration-200
              text-orange-100
            "
          >
            <Home size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Back</span>}
          </Link>

          <Link
            href="/login"
            className="
              flex items-center gap-3 
              px-4 py-3 
              rounded-lg 
              bg-red-600 hover:bg-red-700
              transition-colors duration-200
              w-full
              text-white
            "
          >
            <LogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </Link>
        </div>

        {/* Sidebar Footer Info */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-orange-500 text-xs text-orange-200">
            <p className="font-medium">Vendor ID: {vendorId}</p>
            <p className="text-orange-300 mt-1">© 2024 FoodCourt</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main
        className={`
          ${sidebarOpen ? "ml-64" : "ml-20"} 
          flex-1 
          overflow-auto 
          transition-all duration-300
          flex flex-col
        `}
      >
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {currentTab === "orders" && "📦 Live Orders"}
                {currentTab === "menu" && "🍽️ Menu & Pricing"}
                {currentTab === "analytics" && "📊 Analytics Dashboard"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentTab === "orders" && "Manage incoming orders and update status"}
                {currentTab === "menu" && "Update prices, add items, and manage availability"}
                {currentTab === "analytics" && "View performance metrics and insights"}
              </p>
            </div>

            {/* User Info */}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Vendor Dashboard</p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}