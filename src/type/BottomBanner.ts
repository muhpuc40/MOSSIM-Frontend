export interface BottomBanner {
    id: string
    title: string
    subtitle: string | null
    image: string
    link: string | null
    cta_text: string
    position: number
    sort_order: number
}