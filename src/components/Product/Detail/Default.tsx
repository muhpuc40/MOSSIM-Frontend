'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { ProductType } from '@/type/ProductType'
import Product from '../Product'
import Rate from '@/components/Other/Rate'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs, Scrollbar } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper/types'
import 'swiper/css/bundle'
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { useCart } from '@/context/CartContext'
import { useModalCartContext } from '@/context/ModalCartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useModalWishlistContext } from '@/context/ModalWishlistContext'
import { useCompare } from '@/context/CompareContext'
import { useModalCompareContext } from '@/context/ModalCompareContext'
import ModalSizeguide from '@/components/Modal/ModalSizeguide'
import { productsService, mapToProductType, getDefaultVariant, ApiProduct } from '@/services/products'

interface Props {
    data: Array<ProductType>
    productId: string | number | null
}

const Default: React.FC<Props> = ({ productId }) => {
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
    const [openSizeGuide, setOpenSizeGuide] = useState(false)
    const [activeColor, setActiveColor] = useState<string>('')
    const [activeSize, setActiveSize] = useState<string>('')

    const [detail, setDetail] = useState<ApiProduct | null>(null)
    const [related, setRelated] = useState<ProductType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { addToCart, updateCart, cartState } = useCart()
    const { openModalCart } = useModalCartContext()
    const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist()
    const { openModalWishlist } = useModalWishlistContext()
    const { addToCompare, removeFromCompare, compareState } = useCompare()
    const { openModalCompare } = useModalCompareContext()

    /* ── Fetch product detail ───────────────────────────── */
    useEffect(() => {
        if (!productId) return
        let mounted = true
        setLoading(true)
        setThumbsSwiper(null)
        setActiveColor('')
        setActiveSize('')

        productsService.show(String(productId))
            .then((data) => {
                if (!mounted) return
                setDetail(data)
                const def = getDefaultVariant(data.variants)
                if (def) {
                    setActiveColor(def.color.color_name)
                    setActiveSize(def.size.size_label)
                }
            })
            .catch((err) => { if (mounted) setError(err.message) })
            .finally(() => { if (mounted) setLoading(false) })

        productsService.list({ per_page: 8 })
            .then((list) => { if (mounted) setRelated(list) })
            .catch(() => { })

        return () => { mounted = false }
    }, [productId])

    /* ── Available sizes for selected color ─────────────── */
    const availableSizes = useMemo(() => {
        if (!detail || !activeColor) return []
        return detail.variants
            .filter((v) => v.color.color_name === activeColor)
            .map((v) => v.size.size_label)
    }, [detail, activeColor])

    /* ── On color change: pick first available size ─────── */
    useEffect(() => {
        if (!activeColor) return
        if (activeSize && availableSizes.includes(activeSize)) return
        setActiveSize(availableSizes[0] || '')
    }, [activeColor, availableSizes])

    const selectedVariant = useMemo(() => {
        if (!detail || !activeColor || !activeSize) return null
        return detail.variants.find(
            (v) => v.color.color_name === activeColor && v.size.size_label === activeSize
        ) || null
    }, [detail, activeColor, activeSize])

    const displayPrice =
        selectedVariant?.price ||
        (detail ? getDefaultVariant(detail.variants)?.price : null) ||
        null

    const hasDiscount = !!(displayPrice && displayPrice.discount_type && displayPrice.discount_value > 0)
    const discountLabel = displayPrice && hasDiscount
        ? (displayPrice.discount_type === 'percent'
            ? `-${displayPrice.discount_value}%`
            : `-৳${displayPrice.discount_value}`)
        : ''

    const productMain: ProductType | null = useMemo(
        () => (detail ? mapToProductType(detail) : null),
        [detail]
    )

    const allSizes = useMemo(() => {
        if (!detail) return []
        return Array.from(new Set(detail.variants.map((v) => v.size.size_label)))
    }, [detail])

    /* ── Handlers ───────────────────────────────────────── */
    const handleAddToCart = () => {
        if (!productMain) return
        if (!activeColor) { alert('Please select a color'); return }
        if (!activeSize) { alert('Please select a size'); return }

        if (!cartState.cartArray.find((i) => i.id === productMain.id)) {
            addToCart({ ...productMain })
            updateCart(productMain.id, productMain.quantityPurchase, activeSize, activeColor)
        } else {
            updateCart(productMain.id, productMain.quantityPurchase, activeSize, activeColor)
        }
        openModalCart()
    }

    const handleAddToWishlist = () => {
        if (!productMain) return
        if (wishlistState.wishlistArray.some((i) => i.id === productMain.id)) {
            removeFromWishlist(productMain.id)
        } else {
            addToWishlist(productMain)
        }
        openModalWishlist()
    }

    const handleAddToCompare = () => {
        if (!productMain) return
        if (compareState.compareArray.length < 3) {
            if (compareState.compareArray.some((i) => i.id === productMain.id)) {
                removeFromCompare(productMain.id)
            } else {
                addToCompare(productMain)
            }
        } else {
            alert('Compare up to 3 products')
        }
        openModalCompare()
    }

    const handleIncreaseQuantity = () => {
        if (!productMain) return
        productMain.quantityPurchase += 1
        updateCart(productMain.id, productMain.quantityPurchase + 1, activeSize, activeColor)
    }
    const handleDecreaseQuantity = () => {
        if (!productMain || productMain.quantityPurchase <= 1) return
        productMain.quantityPurchase -= 1
        updateCart(productMain.id, productMain.quantityPurchase - 1, activeSize, activeColor)
    }

    if (loading) return <div className="text-center py-32 text-secondary">Loading product...</div>
    if (error || !detail || !productMain) return <div className="text-center py-32 text-red">{error || 'Product not found'}</div>

    const safeThumbs = thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null

    return (
        <>
            <div className="product-detail default">
                <div className="featured-product underwear md:py-20 py-10">
                    <div className="container flex justify-between gap-y-6 flex-wrap">

                        {/* ── Images ─────────────────────────── */}
                        <div className="list-img md:w-1/2 md:pr-[45px] w-full">
                            <Swiper
                                slidesPerView={1}
                                spaceBetween={0}
                                thumbs={{ swiper: safeThumbs }}
                                modules={[Thumbs]}
                                className="mySwiper2 rounded-2xl overflow-hidden"
                            >
                                {detail.images.map((item, index) => (
                                    <SwiperSlide key={index}>
                                        <Image
                                            src={item.url}
                                            width={1000}
                                            height={1000}
                                            alt='prd-img'
                                            className='w-full aspect-[3/4] object-cover'
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            <Swiper
                                onSwiper={setThumbsSwiper}
                                spaceBetween={0}
                                slidesPerView={4}
                                freeMode={true}
                                watchSlidesProgress={true}
                                modules={[Navigation, Thumbs]}
                                className="mySwiper"
                            >
                                {detail.images.map((item, index) => (
                                    <SwiperSlide key={index}>
                                        <Image
                                            src={item.url}
                                            width={1000}
                                            height={1000}
                                            alt='prd-img'
                                            className='w-full aspect-[3/4] object-cover rounded-xl'
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* ── Info ──────────────────────────── */}
                        <div className="product-infor md:w-1/2 w-full lg:pl-[15px] md:pl-2">
                            <div className="flex justify-between">
                                <div>
                                    <div className="caption2 text-secondary font-semibold uppercase">{detail.type}</div>
                                    <div className="heading4 mt-1">{detail.name}</div>
                                </div>
                                <div
                                    className={`add-wishlist-btn w-12 h-12 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white ${wishlistState.wishlistArray.some(item => item.id === detail.id) ? 'active' : ''}`}
                                    onClick={handleAddToWishlist}
                                >
                                    {wishlistState.wishlistArray.some(item => item.id === detail.id)
                                        ? <Icon.Heart size={24} weight='fill' className='text-white' />
                                        : <Icon.Heart size={24} />}
                                </div>
                            </div>

                            <div className="flex items-center mt-3">
                                
                                <span className='caption1 text-secondary'>{detail.description}</span>
                            </div>

                            {/* Price */}
                            {displayPrice && (
                                <div className="flex items-center gap-3 flex-wrap mt-5 pb-6 border-b border-line">
                                    <div className="product-price heading5">
                                        {displayPrice.currency.symbol}{displayPrice.current_price}
                                    </div>
                                    {hasDiscount && (
                                        <>
                                            <div className='w-px h-4 bg-line'></div>
                                            <div className="product-origin-price font-normal text-secondary2">
                                                <del>{displayPrice.currency.symbol}{displayPrice.actual_price}</del>
                                            </div>
                                            <div className="product-sale caption2 font-semibold bg-green px-3 py-0.5 inline-block rounded-full">
                                                {discountLabel}
                                            </div>
                                        </>
                                    )}
    
                                </div>
                            )}

                            <div className="list-action mt-6">
                                {/* Colors — hex swatches */}
                                <div className="choose-color">
                                    <div className="text-title">Colors: <span className='text-title color'>{activeColor}</span></div>
                                    <div className="list-color flex items-center gap-2 flex-wrap mt-3">
                                        {detail.colors.map((color, index) => (
                                            <div
                                                key={index}
                                                className={`color-item w-12 h-12 rounded-xl duration-300 relative cursor-pointer ${activeColor === color.color_name ? 'active border-2 border-black' : 'border border-line'}`}
                                                style={{ backgroundColor: color.color_hex || '#ccc' }}
                                                onClick={() => setActiveColor(color.color_name)}
                                            >
                                                <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                                    {color.color_name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sizes — filtered by color */}
                                <div className="choose-size mt-5">
                                    <div className="heading flex items-center justify-between">
                                        <div className="text-title">Size: <span className='text-title size'>{activeSize}</span></div>
                                        <div
                                            className="caption1 size-guide text-red underline cursor-pointer"
                                            onClick={() => setOpenSizeGuide(true)}
                                        >
                                            Size Guide
                                        </div>
                                        <ModalSizeguide data={productMain} isOpen={openSizeGuide} onClose={() => setOpenSizeGuide(false)} />
                                    </div>
                                    <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                                        {allSizes.map((size, index) => {
                                            const isAvailable = availableSizes.includes(size)
                                            const wide = size.length > 2
                                            return (
                                                <div
                                                    key={index}
                                                    className={`size-item ${wide ? 'px-3 py-2' : 'w-12 h-12'} flex items-center justify-center text-button rounded-full bg-white border border-line ${
                                                        !isAvailable
                                                            ? 'opacity-40 cursor-not-allowed line-through'
                                                            : activeSize === size
                                                                ? 'active'
                                                                : 'cursor-pointer'
                                                    }`}
                                                    onClick={() => isAvailable && setActiveSize(size)}
                                                >
                                                    {size}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="text-title mt-5">Quantity:</div>
                                <div className="choose-quantity flex items-center lg:justify-between gap-5 gap-y-3 mt-3">
                                    <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                                        <Icon.Minus
                                            size={20}
                                            onClick={handleDecreaseQuantity}
                                            className={`${productMain.quantityPurchase === 1 ? 'disabled' : ''} cursor-pointer`}
                                        />
                                        <div className="body1 font-semibold">{productMain.quantityPurchase}</div>
                                        <Icon.Plus
                                            size={20}
                                            onClick={handleIncreaseQuantity}
                                            className='cursor-pointer'
                                        />
                                    </div>
                                    <div onClick={handleAddToCart} className="button-main w-full text-center bg-white text-black border border-black">Add To Cart</div>
                                </div>

                                <div className="button-block mt-5">
                                    <div className="button-main w-full text-center">Buy It Now</div>
                                </div>

                                <div className="flex items-center lg:gap-20 gap-8 mt-5 pb-6 border-b border-line">
                                    <div className="compare flex items-center gap-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleAddToCompare() }}>
                                        <div className="compare-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white">
                                            <Icon.ArrowsCounterClockwise className='heading6' />
                                        </div>
                                        <span>Compare</span>
                                    </div>
                                    <div className="share flex items-center gap-3 cursor-pointer">
                                        <div className="share-btn md:w-12 md:h-12 w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-xl duration-300 hover:bg-black hover:text-white">
                                            <Icon.ShareNetwork weight='fill' className='heading6' />
                                        </div>
                                        <span>Share Products</span>
                                    </div>
                                </div>

                                <div className="more-infor mt-6">
       
                                    <div className="flex items-center gap-1 mt-3">
                                        <div className="text-title">SKU:</div>
                                        <div className="text-secondary">{selectedVariant?.sku || detail.product_code}</div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-3">
                                        <div className="text-title">Categories:</div>
                                        <div className="text-secondary capitalize">{detail.type}</div>
                                    </div>

                                </div>

                                
                            </div>


                        </div>
                    </div>
                </div>

                {/* Related products */}
                <div className="related-product md:py-1 py-10">
                    <div className="container">
                        <div className="heading3 text-center">Related Products</div>
                        <div className="list-product hide-product-sold grid lg:grid-cols-4 grid-cols-2 md:gap-[30px] gap-5 md:mt-10 mt-6">
                            {related.filter((p) => p.id !== detail.id).slice(0, 4).map((item) => (
                                <Product key={item.id} data={item} type='grid' style='style-1' />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Default