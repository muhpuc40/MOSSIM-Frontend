import type { Banner } from '@/type/Banner'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface BannerResponse {
    success: boolean
    data: Banner[]
}

export const bannersService = {
    list: async (): Promise<Banner[]> => {
        const res = await fetch(`${API_URL}/banners`, { cache: 'no-store' })

        if (!res.ok) {
            throw new Error(`Failed to load banners (${res.status})`)
        }

        const json: BannerResponse = await res.json()
        return json.data || []
    },
}