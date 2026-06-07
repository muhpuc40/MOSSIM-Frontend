import { ProductType } from '@/type/ProductType'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

/* ── Raw API shapes ─────────────────────────────── */
interface ApiImage {
    url: string
    is_primary?: boolean
}
interface ApiColor {
    color_name: string
    color_hex: string | null
}
interface ApiSize {
    size_label: string
    sort_order?: number
}
export interface ApiPrice {
    actual_price: number
    current_price: number
    discount_type: string | null
    discount_value: number
    currency: { code?: string; symbol: string }
}
export interface ApiVariant {
    id: string
    sku: string
    color: ApiColor
    size: ApiSize
    price: ApiPrice
}
export interface ApiListProduct {
    id: string
    product_code: string
    name: string
    description: string
    type: 'man' | 'women' | 'kids' | 'unisex'
    images: ApiImage[]
    price: ApiPrice | null
    colors: ApiColor[]
    sizes: ApiSize[]
}
export interface ApiDetailProduct extends ApiListProduct {
    variants: ApiVariant[]
}

/* ── Map API → template's ProductType ──────────── */
export function mapToProductType(p: ApiListProduct | ApiDetailProduct): ProductType {
    const allImages = (p.images || []).map((img) => img.url)
    const primaryImages = (p.images || []).filter((img) => img.is_primary).map((img) => img.url)
    const firstImage = allImages[0] || ''

    const variation = (p.colors || []).map((c) => ({
        color: c.color_name,
        colorCode: c.color_hex || '#000000',
        colorImage: firstImage,
        image: firstImage,
    }))

    const sizes = (p.sizes || []).map((s) => s.size_label)

    // For detail products, price lives in variants. For list, it's at top level.
    let price = 0
    let originPrice = 0
    let discountType = ''
    let discountValue = 0

    if (p.price) {
        price = p.price.current_price
        originPrice = p.price.actual_price
        discountType = p.price.discount_type || ''
        discountValue = p.price.discount_value || 0
    } else if ('variants' in p && p.variants.length > 0) {
        const firstVariantPrice = p.variants[0].price
        price = firstVariantPrice.current_price
        originPrice = firstVariantPrice.actual_price
        discountType = firstVariantPrice.discount_type || ''
        discountValue = firstVariantPrice.discount_value || 0
    }

    return {
        id: p.id,
        category: 'fashion',
        type: p.type,
        name: p.name,
        gender: p.type,
        new: false,
        sale: originPrice > price,
        rate: discountValue,             // carries discount_value
        price,
        originPrice,
        brand: p.product_code,           // carries product_code
        sold: 0,
        quantity: 100,
        quantityPurchase: 1,
        sizes,
        variation,
        thumbImage: primaryImages.length ? primaryImages : allImages.slice(0, 2),
        images: allImages,
        description: p.description || '',
        action: 'add to cart',
        slug: discountType,              // carries discount_type
    }
}

/* ── Service ───────────────────────────────────── */
interface ListParams {
    type?: 'all' | 'man' | 'women' | 'kids' | 'unisex'
    per_page?: number
}

export const productsService = {
    list: async (params: ListParams = {}): Promise<ProductType[]> => {
        const search = new URLSearchParams()
        if (params.type && params.type !== 'all') search.append('type', params.type)
        if (params.per_page) search.append('per_page', String(params.per_page))

        const qs = search.toString()
        const res = await fetch(`${API_URL}/products${qs ? '?' + qs : ''}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to load products (${res.status})`)

        const json = await res.json()
        return (json.data as ApiListProduct[]).map(mapToProductType)
    },

    show: async (id: string): Promise<ApiDetailProduct> => {
        const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Product not found (${res.status})`)

        const json = await res.json()
        return json.data as ApiDetailProduct
    },
}