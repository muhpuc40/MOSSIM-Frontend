import type { CategoryBanner } from '@/type/CategoryBanner'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface CategoryBannerResponse {
    success: boolean
    data: CategoryBanner[]
}

export const categoryBannersService = {
    list: async (): Promise<CategoryBanner[]> => {
        try {
            const res = await fetch(`${API_URL}/category-banners`, {
                cache: 'no-store',
                next: { revalidate: 3600 }
            })

            if (!res.ok) {
                throw new Error(`Failed to load category banners (${res.status})`)
            }

            const json: CategoryBannerResponse = await res.json()
            return json.data || []
        } catch (error) {
            console.error('Category banner fetch failed:', error)
            return []
        }
    }
}