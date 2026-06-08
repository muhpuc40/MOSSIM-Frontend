import { ProductType } from '@/type/ProductType'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

/* ── Raw API shapes ─────────────────────────────── */
interface ApiImage {
    url: string
    is_primary: boolean
}
interface ApiColor {
    color_name: string
    color_hex: string | null
}
interface ApiSize {
    size_label: string
}
export interface ApiPrice {
    actual_price: number
    current_price: number
    discount_type: string | null
    discount_value: number
    currency: { symbol: string }
}
export interface ApiVariant {
    id: string
    sku: string
    is_default: boolean
    color: ApiColor
    size: ApiSize
    price: ApiPrice | null
}
export interface ApiProduct {
    id: string
    product_code: string
    name: string
    description: string
    type: 'man' | 'women' | 'kids' | 'unisex'
    images: ApiImage[]
    colors: ApiColor[]
    variants: ApiVariant[]
}

/* ── Helpers ───────────────────────────────────── */
export function getDefaultVariant(variants: ApiVariant[]): ApiVariant | null {
    return variants.find((v) => v.is_default) || variants[0] || null
}

/* ── Variant cache (for Quick View modal) ──────── */
const variantsCache = new Map<string, ApiVariant[]>()

export function getProductVariants(productId: string): ApiVariant[] {
    return variantsCache.get(productId) || []
}

/* ── Map API → template ProductType ────────────── */
export function mapToProductType(p: ApiProduct): ProductType {
    // Cache variants for later lookup
    if (p.variants && p.variants.length > 0) {
        variantsCache.set(p.id, p.variants)
    }

    const allImages     = (p.images || []).map((img) => img.url)
    const primaryImages = (p.images || []).filter((img) => img.is_primary).map((img) => img.url)
    const firstImage    = allImages[0] || ''

    // Variation = colors (hex-based)
    const variation = (p.colors || []).map((c) => ({
        color:      c.color_name,
        colorCode:  c.color_hex || '#000000',
        colorImage: firstImage,
        image:      firstImage,
    }))

    // All unique sizes (modal/detail filters available ones by color via cache)
    const allSizes = Array.from(
        new Set((p.variants || []).map((v) => v.size?.size_label).filter(Boolean))
    ) as string[]

    // Default variant drives initial price
    const def = getDefaultVariant(p.variants || [])
    const price         = def?.price?.current_price ?? 0
    const originPrice   = def?.price?.actual_price  ?? 0
    const discountType  = def?.price?.discount_type ?? ''
    const discountValue = def?.price?.discount_value ?? 0

    return {
        id:               p.id,
        category:         'fashion',
        type:             p.type,
        name:             p.name,
        gender:           p.type,
        new:              false,
        sale:             originPrice > price,
        rate:             discountValue,                    // carries discount_value
        price,
        originPrice,
        brand:            p.product_code,                   // carries product_code (SKU)
        sold:             0,
        quantity:         100,
        quantityPurchase: 1,
        sizes:            allSizes,
        variation,
        thumbImage:       primaryImages.length ? primaryImages : allImages.slice(0, 2),
        images:           allImages,
        description:      p.description || '',
        action:           'add to cart',
        slug:             discountType,                     // carries discount_type
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
        return (json.data as ApiProduct[]).map(mapToProductType)
    },

    show: async (id: string): Promise<ApiProduct> => {
        const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Product not found (${res.status})`)

        const json = await res.json()
        const data = json.data as ApiProduct

        if (data.variants && data.variants.length > 0) {
            variantsCache.set(data.id, data.variants)
        }
        return data
    },
}