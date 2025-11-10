"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, ChefHat } from "lucide-react";
import { api } from "@/lib/api";

export default function VendorPortalHome() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVendors = async () => {
      try {
        const data = await api.vendors();
        setVendors(data);
      } catch (e) {
        console.error("Error loading vendors:", e);
      } finally {
        setLoading(false);
      }
    };
    loadVendors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-orange-800 font-medium">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat size={40} className="text-orange-600" />
            <h1 className="text-4xl font-bold text-orange-900">Vendor Portal</h1>
          </div>
          <p className="text-orange-700 text-lg">Select your restaurant to manage orders and menu</p>
        </div>

        {vendors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No vendors available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendor-portal/${vendor.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition p-8 cursor-pointer border-2 border-transparent hover:border-orange-500 group"
              >
                <div className="mb-4">
                  <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition">
                    <BarChart3 className="text-orange-600" size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{vendor.name}</h3>
                  <p className="text-gray-600 mt-1">📍 Stall {vendor.stall_no || "—"}</p>
                </div>

                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-600">✓</span> Real-time order tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-600">✓</span> Menu & pricing management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-600">✓</span> Detailed analytics
                  </li>
                </ul>

                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-lg transition">
                  Open Dashboard →
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

