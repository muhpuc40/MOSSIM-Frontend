import { Order, CouponResult } from '@/type/Order'
import { getProductVariants, productsService } from './products'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const headers = (token: string) => ({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
})

/* ── Resolve cart items to variant_id + qty ── */
export async function resolveCartItems(
    cartArray: any[]
): Promise<{ variant_id: string; qty: number }[] | null> {
    const items: { variant_id: string; qty: number }[] = []

    for (const item of cartArray) {
        let variants = getProductVariants(item.id)

        // Cache miss — fetch product to populate cache
        if (!variants.length) {
            try {
                await productsService.show(item.id)
                variants = getProductVariants(item.id)
            } catch {
                console.error(`Failed to resolve variants for product ${item.id}`)
                return null
            }
        }

        // Match by color + size
        let variant = variants.find(v =>
            v.color?.color_name === item.selectedColor &&
            v.size?.size_label  === item.selectedSize
        )

        // Fallback: match by size only
        if (!variant && item.selectedSize) {
            variant = variants.find(v => v.size?.size_label === item.selectedSize)
        }

        // Fallback: default variant
        if (!variant) {
            variant = variants.find(v => v.is_default) ?? variants[0]
        }

        if (!variant) {
            console.error(`No variant found for ${item.name}`)
            return null
        }

        items.push({
            variant_id: variant.id,
            qty: item.quantity || 1,
        })
    }

    return items
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