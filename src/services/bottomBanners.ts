import type { BottomBanner } from '@/type/BottomBanner'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface BottomBannerResponse {
    success: boolean
    data: BottomBanner[]
}

export const bottomBannersService = {
    list: async (): Promise<BottomBanner[]> => {
        try {
            const res = await fetch(`${API_URL}/bottom-banners`, {
                cache: 'no-store',
                next: { revalidate: 3600 }
            })

            if (!res.ok) {
                throw new Error(`Failed to load bottom banners (${res.status})`)
            }

            const json: BottomBannerResponse = await res.json()
            return json.data || []
        } catch (error) {
            console.error('Bottom banner fetch failed:', error)
            return []
        }
    }
}