import { Order, CouponResult } from '@/type/Order'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const headers = (token: string) => ({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
})

/* ── Resolve cart items to variant_id + qty ──
   Cart items already carry variant_id (set at add-to-cart time). */
export function resolveCartItems(
    cartArray: any[]
): { variant_id: string; qty: number }[] | null {
    if (!cartArray.length) return null

    const items = cartArray
        .filter(item => item.variant_id)
        .map(item => ({
            variant_id: item.variant_id,
            qty: item.quantity || 1,
        }))

    return items.length ? items : null
}

/* ── Orders service ──────────────────────── */
export const ordersService = {

    validateCoupon: async (code: string, subtotal: number): Promise<CouponResult> => {
        const res = await fetch(`${API_URL}/coupons/validate`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code.toUpperCase().trim(), subtotal }),
        })
        const json = await res.json()
        if (!res.ok) throw json
        return json.data
    },

    track: async (orderNumber: string): Promise<{
        timeline: Array<{
            status: string;
            status_label?: string;
            timestamp: string;
            description?: string;
            location?: string;
            note?: string;
        }>;
        shipment?: any;
        }> => {
        const res = await fetch(`${API_URL}/shipments/track/${orderNumber}`, {
            cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json.message || `Failed to track order (${res.status})`);
        }
        return {
            timeline: json.data.order_timeline || json.data.timeline || [],
            shipment: json.data.shipment,
        };
    },

    placeOrder: async (token: string, data: {
        shipping_address_id: string
        items: { variant_id: string; qty: number }[]
        coupon_code?: string
        shipping_fee?: number
        notes?: string
    }): Promise<Order> => {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: headers(token),
            body: JSON.stringify(data),
        })
        const json = await res.json()
        if (!res.ok) throw json
        return json.data
    },

    placeGuestOrder: async (data: {
        name: string
        phone: string
        email?: string
        address: {
            recipient_name: string
            phone: string
            address_line_1: string
            address_line_2?: string
            city: string
            state?: string
            postal_code?: string
            country: string
        }
        items: { variant_id: string; qty: number }[]
        coupon_code?: string
        shipping_fee?: number
        notes?: string
    }): Promise<Order> => {
        const res = await fetch(`${API_URL}/orders/guest`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        const json = await res.json()
        if (!res.ok) throw json
        return json.data
    },

    list: async (token: string, status?: string): Promise<{ data: Order[]; meta: any }> => {
        const params = status ? `?status=${status}` : ''
        const res = await fetch(`${API_URL}/orders${params}`, { headers: headers(token) })
        const json = await res.json()
        if (!res.ok) throw json
        return json.data
    },

    show: async (token: string, orderId: string): Promise<Order> => {
        const res = await fetch(`${API_URL}/orders/${orderId}`, { headers: headers(token) })
        const json = await res.json()
        if (!res.ok) throw json
        return json.data
    },

    cancel: async (token: string, orderId: string, reason?: string): Promise<Order> => {
        const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
            method: 'PATCH',
            headers: headers(token),
            body: JSON.stringify({ reason: reason || 'Cancelled by customer.' }),
        })
        const json = await res.json()
        if (!res.ok) throw json
        return json.data
    },
}