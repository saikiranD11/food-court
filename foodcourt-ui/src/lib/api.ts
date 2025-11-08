const BASE = process.env.NEXT_PUBLIC_API_BASE!;

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers||{}) } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}
export type AuthOut = { user_token: string; user_id: number; email: string; display_name?: string };

export type Vendor = { id: number; name: string; stall_no?: string | null };
export type Menu = { id: number; vendor_id: number; item_name: string; price: string; is_active: boolean };
export type CartItem = { id: number; vendor_id: number; menu_id: number; item_name: string; qty: number; price_each: string; line_total: string };
export type Cart = { cart_id: number; user_token: string; items: CartItem[]; subtotal: string };
export type CheckoutResp = { order_id: number; status: string; payable_amount: string; payment_link: string };
export type OrderStatus = { order_id: number; status: string; total_gross: string };
export type OrderLineBrief = {
  vendor_name: string;
  item_name: string;
  qty: number;
  line_total: string;
};
export type OrderHistoryItem = {
  order_id: number;
  status: string;
  total_gross: string;
  created_at: string;   // ISO
  payment_id?: string | null;
  vendors: string[];
  lines: OrderLineBrief[];
};
export type OrderHistory = {
  user_token: string;
  orders: OrderHistoryItem[];
};

export const api = {
  vendors: () => http<Vendor[]>(`${BASE}/catalog/vendors`),
  menus: (vendor_id?: number) => {
    const q = vendor_id ? `?vendor_id=${vendor_id}` : "";
    return http<Menu[]>(`${BASE}/catalog/menus${q}`);
  },
  getCart: (user_token: string) => http<Cart>(`${BASE}/cart?user_token=${user_token}`),
  addToCart: (user_token: string, menu_id: number, qty = 1) =>
    http<Cart>(`${BASE}/cart/add`, { method: "POST", body: JSON.stringify({ user_token, menu_id, qty }) }),
  removeFromCart: (user_token: string, cart_item_id: number) =>
    http<Cart>(`${BASE}/cart/remove`, { method: "POST", body: JSON.stringify({ user_token, cart_item_id }) }),
  checkout: (user_token: string) =>
    http<CheckoutResp>(`${BASE}/checkout`, { method: "POST", body: JSON.stringify({ user_token }) }),
  orderStatus: (order_id: number) => http<OrderStatus>(`${BASE}/orders/${order_id}`),
    history: (user_token: string) =>
    http<OrderHistory>(`${BASE}/orders/history?user_token=${encodeURIComponent(user_token)}`),
signup: (email: string, password: string, display_name?: string, guest_token?: string) =>
    http<AuthOut>(`${BASE}/auth/signup`, {
      method: "POST",
      body: JSON.stringify({ email, password, display_name, guest_token }),
    }),
  login: (email: string, password: string, guest_token?: string) =>
    http<AuthOut>(`${BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password, guest_token }),
    }),
};