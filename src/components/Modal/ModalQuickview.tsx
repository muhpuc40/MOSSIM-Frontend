'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { useModalQuickviewContext } from '@/context/ModalQuickviewContext'
import { useCart } from '@/context/CartContext'
import { useModalCartContext } from '@/context/ModalCartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useModalWishlistContext } from '@/context/ModalWishlistContext'
import { useCompare } from '@/context/CompareContext'
import { useModalCompareContext } from '@/context/ModalCompareContext'
import ModalSizeguide from './ModalSizeguide'
import Link from 'next/link'
import { getProductVariants, getDefaultVariant } from '@/services/products'

const ModalQuickview = () => {
    const { selectedProduct, closeQuickview } = useModalQuickviewContext()
    const [openSizeGuide, setOpenSizeGuide] = useState(false)
    const [activeColor, setActiveColor] = useState<string>('')
    const [activeSize, setActiveSize] = useState<string>('')

    const { addToCart, updateCart, cartState } = useCart()
    const { openModalCart } = useModalCartContext()
    const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist()
    const { openModalWishlist } = useModalWishlistContext()
    const { addToCompare, removeFromCompare, compareState } = useCompare()
    const { openModalCompare } = useModalCompareContext()

    /* ── Variants from cache ────────────────────────────── */
    const variants = useMemo(
        () => (selectedProduct ? getProductVariants(selectedProduct.id) : []),
        [selectedProduct]
    )

    /* ── Set default color & size when modal opens ──────── */
    useEffect(() => {
        if (!selectedProduct || variants.length === 0) {
            setActiveColor('')
            setActiveSize('')
            return
        }
        const def = getDefaultVariant(variants)
        setActiveColor(def?.color?.color_name || '')
        setActiveSize(def?.size?.size_label || '')
    }, [selectedProduct, variants])

    /* ── Sizes available for selected color ─────────────── */
    const availableSizes = useMemo(() => {
        if (!activeColor) return []
        return variants
            .filter((v) => v.color.color_name === activeColor)
            .map((v) => v.size.size_label)
    }, [activeColor, variants])

    /* ── When color changes: pick first available size ──── */
    useEffect(() => {
        if (!activeColor) return
        if (activeSize && availableSizes.includes(activeSize)) return
        setActiveSize(availableSizes[0] || '')
    }, [activeColor, availableSizes])

    /* ── Currently selected variant (drives price) ──────── */
    const selectedVariant = useMemo(() => {
        if (!activeColor || !activeSize) return null
        return variants.find(
            (v) => v.color.color_name === activeColor && v.size.size_label === activeSize
        ) || null
    }, [activeColor, activeSize, variants])

    /* ── Display price: selected variant or default ─────── */
    const displayPrice =
        selectedVariant?.price ||
        getDefaultVariant(variants)?.price ||
        null

    const hasDiscount = !!(displayPrice && displayPrice.discount_type && displayPrice.discount_value > 0)
    const discountLabel = displayPrice && hasDiscount
        ? (displayPrice.discount_type === 'percent'
            ? `-${displayPrice.discount_value}%`
            : `-৳${displayPrice.discount_value}`)
        : ''

    /* ── Handlers ───────────────────────────────────────── */
    const handleAddToCart = () => {
        if (!selectedProduct) return
        if (!cartState.cartArray.find((i) => i.id === selectedProduct.id)) {
            addToCart({ ...selectedProduct })
            updateCart(selectedProduct.id, selectedProduct.quantityPurchase, activeSize, activeColor)
        } else {
            updateCart(selectedProduct.id, selectedProduct.quantityPurchase, activeSize, activeColor)
        }
        openModalCart()
        closeQuickview()
    }

    const handleAddToWishlist = () => {
        if (!selectedProduct) return
        if (wishlistState.wishlistArray.some((i) => i.id === selectedProduct.id)) {
            removeFromWishlist(selectedProduct.id)
        } else {
            addToWishlist(selectedProduct)
        }
        openModalWishlist()
    }

    const handleAddToCompare = () => {
        if (!selectedProduct) return
        if (compareState.compareArray.length < 3) {
            if (compareState.compareArray.some((i) => i.id === selectedProduct.id)) {
                removeFromCompare(selectedProduct.id)
            } else {
                addToCompare(selectedProduct)
            }
        } else {
            alert('Compare up to 3 products')
        }
        openModalCompare()
    }

    const handleIncreaseQuantity = () => {
        if (!selectedProduct) return
        selectedProduct.quantityPurchase += 1
        updateCart(selectedProduct.id, selectedProduct.quantityPurchase + 1, activeSize, activeColor)
    }
    const handleDecreaseQuantity = () => {
        if (!selectedProduct || selectedProduct.quantityPurchase <= 1) return
        selectedProduct.quantityPurchase -= 1
        updateCart(selectedProduct.id, selectedProduct.quantityPurchase - 1, activeSize, activeColor)
    }

    return (
        <>
            <div className={`modal-quickview-block`} onClick={closeQuickview}>
                <div
                    className={`modal-quickview-main py-6 ${selectedProduct !== null ? 'open' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex h-full max-md:flex-col-reverse gap-y-6">
                        {/* Images — all images */}
                        <div className="left lg:w-[388px] md:w-[300px] flex-shrink-0 px-6">
                            <div className="list-img max-md:flex items-center gap-4">
                                {selectedProduct?.images.map((item, index) => (
                                    <div key={index} className="bg-img w-full aspect-[3/4] max-md:w-[150px] max-md:flex-shrink-0 rounded-[20px] overflow-hidden md:mt-6">
                                        <Image
                                            src={item}
                                            width={1500}
                                            height={2000}
                                            alt={selectedProduct?.name}
                                            priority
                                            className='w-full h-full object-cover'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="right w-full px-4">
                            <div className="heading pb-6 px-4 flex items-center justify-between relative">
                                <div className="heading5">Quick View</div>
                                <div
                                    className="close-btn absolute right-0 top-0 w-6 h-6 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
                                    onClick={closeQuickview}
                                >
                                    <Icon.X size={14} />
                                </div>
                            </div>

                            <div className="product-infor px-4">
                                <div className="flex justify-between">
                                    <div>
                                        <div className="caption2 text-secondary font-semibold uppercase">{selectedProduct?.type}</div>
                                        <div className="heading4 mt-1">{selectedProduct?.name}</div>
                                    </div>
                                    <div
                                        className={`add-wishlist-btn w-10 h-10 flex items-center justify-center border border-line cursor-pointer rounded-lg duration-300 flex-shrink-0 hover:bg-black hover:text-white ${wishlistState.wishlistArray.some((i) => i.id === selectedProduct?.id) ? 'active' : ''}`}
                                        onClick={handleAddToWishlist}
                                    >
                                        {wishlistState.wishlistArray.some((i) => i.id === selectedProduct?.id)
                                            ? <Icon.Heart size={20} weight='fill' className='text-red' />
                                            : <Icon.Heart size={20} />}
                                    </div>
                                </div>

                                {/* Price — from selected variant */}
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
                                        <div className='desc text-secondary mt-3'>{selectedProduct?.description}</div>
                                    </div>
                                )}

                                <div className="list-action mt-6">
                                    {/* Colors */}
                                    <div className="choose-color">
                                        <div className="text-title">Colors: <span className='text-title color'>{activeColor}</span></div>
                                        <div className="list-color flex items-center gap-2 flex-wrap mt-3">
                                            {selectedProduct?.variation.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className={`color-item w-12 h-12 rounded-xl duration-300 relative cursor-pointer ${activeColor === item.color ? 'active border-2 border-black' : 'border border-line'}`}
                                                    style={{ backgroundColor: item.colorCode }}
                                                    onClick={() => setActiveColor(item.color)}
                                                >
                                                    <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                                                        {item.color}
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
                                            <ModalSizeguide data={selectedProduct} isOpen={openSizeGuide} onClose={() => setOpenSizeGuide(false)} />
                                        </div>
                                        <div className="list-size flex items-center gap-2 flex-wrap mt-3">
                                            {selectedProduct?.sizes.map((item, index) => {
                                                const isAvailable = availableSizes.includes(item)
                                                const wide = item.length > 2
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`size-item ${wide ? 'px-3 py-2' : 'w-12 h-12'} flex items-center justify-center text-button rounded-full bg-white border border-line ${
                                                            !isAvailable
                                                                ? 'opacity-40 cursor-not-allowed line-through'
                                                                : activeSize === item
                                                                    ? 'active'
                                                                    : 'cursor-pointer'
                                                        }`}
                                                        onClick={() => isAvailable && setActiveSize(item)}
                                                    >
                                                        {item}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="text-title mt-5">Quantity:</div>
                                    <div className="choose-quantity flex items-center max-xl:flex-wrap lg:justify-between gap-5 mt-3">
                                        <div className="quantity-block md:p-3 max-md:py-1.5 max-md:px-3 flex items-center justify-between rounded-lg border border-line sm:w-[180px] w-[120px] flex-shrink-0">
                                            <Icon.Minus
                                                onClick={handleDecreaseQuantity}
                                                className={`${selectedProduct?.quantityPurchase === 1 ? 'disabled' : ''} cursor-pointer body1`}
                                            />
                                            <div className="body1 font-semibold">{selectedProduct?.quantityPurchase}</div>
                                            <Icon.Plus
                                                onClick={handleIncreaseQuantity}
                                                className='cursor-pointer body1'
                                            />
                                        </div>
                                        <div onClick={handleAddToCart} className="button-main w-full text-center bg-white text-black border border-black">Add To Cart</div>
                                    </div>

                                    <div className="button-block mt-5">
                                        <Link href="/checkout" className="button-main w-full text-center">Buy It Now</Link>
                                    </div>

                                    <div className="flex items-center flex-wrap lg:gap-20 gap-8 gap-y-4 mt-5">
                                        <div className="compare flex items-center gap-3 cursor-pointer" onClick={handleAddToCompare}>
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
                                            <div className="text-secondary">{selectedVariant?.sku || selectedProduct?.brand}</div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-3">
                                            <div className="text-title">Categories:</div>
                                            <div className="text-secondary capitalize">{selectedProduct?.type}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalQuickview