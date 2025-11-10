import Link from "next/link";
import { api, Vendor } from "@/lib/api";
import { Search, MapPin, Star, Clock, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

async function getVendors(): Promise<Vendor[]> {
  return api.vendors();
}

export default async function Home() {
  const vendors = await getVendors();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 pb-16 pt-8">
        <div className="mx-auto max-w-5xl px-4">
          {/* Location Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
            <MapPin className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-medium">Food Court, Block A</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Order from your
            <span className="block text-rose-600">favorite vendors</span>
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Fresh food delivered to your table in minutes
          </p>

          {/* Search Bar (Decorative for now) */}
          <div className="relative mb-8 max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for dishes, cuisines..."
              className="w-full rounded-full border-2 border-gray-200 py-4 pl-12 pr-4 text-base shadow-sm transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <Star className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{vendors.length}+ Vendors</div>
                <div className="text-gray-500">Ready to serve</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">5-10 mins</div>
                <div className="text-gray-500">Avg. prep time</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">100+ Orders</div>
                <div className="text-gray-500">Today</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Our Vendors</h2>
          <span className="text-sm text-gray-500">{vendors.length} available</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <Link
              key={v.id}
              href={`/vendor/${v.id}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-orange-50 opacity-0 transition-opacity group-hover:opacity-100" />
              
              {/* Content */}
              <div className="relative p-6">
                {/* Vendor Icon/Avatar */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-2xl font-bold text-white shadow-lg">
                  {v.name.charAt(0)}
                </div>

                {/* Vendor Name */}
                <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                  {v.name}
                </h3>

                {/* Stall Info */}
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Stall {v.stall_no || "—"}</span>
                </div>

                {/* Tags/Features */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Open Now
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    Fast Service
                  </span>
                </div>

                {/* Arrow Icon */}
                <div className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:translate-x-1">
                  <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            Why choose FoodCourt?
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100">
                <Clock className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Lightning Fast</h3>
              <p className="text-sm text-gray-600">
                Get your food delivered to your table in 5-10 minutes
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
                <Star className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Quality Food</h3>
              <p className="text-sm text-gray-600">
                Fresh ingredients from trusted vendors only
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Easy Tracking</h3>
              <p className="text-sm text-gray-600">
                Real-time order status from prep to ready
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}