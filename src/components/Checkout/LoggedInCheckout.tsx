'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import TopNavOne from '@/components/Header/TopNav/TopNavOne'
import MenuOne from '@/components/Header/Menu/MenuOne'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Footer from '@/components/Footer/Footer'
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import Loading from '@/components/Other/Loading'
import { authService } from '@/services/auth'
import { ordersService, resolveCartItems } from '@/services/orders'
import { CustomerAddress } from '@/type/Auth'
import type { CouponResult } from '@/type/Order'

const SHIP_INSIDE  = 80
const SHIP_OUTSIDE = 120

const PAYMENT_METHODS = [
    { value: 'cod',   label: 'Cash on Delivery', desc: 'Pay when your order arrives at your door.' },
    { value: 'bkash', label: 'bKash',             desc: 'Pay via bKash mobile banking.' },
    { value: 'nagad', label: 'Nagad',             desc: 'Pay via Nagad mobile banking.' },
]

const LoggedInCheckout = () => {
    const router       = useRouter()
    const searchParams = useSearchParams()
    const { cartState, removeFromCart } = useCart()
    const { user, token, isLoggedIn, loading: authLoading } = useAuth()

    /* ── URL params from cart ─────────────── */
    const urlShipType = searchParams.get('ship_type') ?? 'inside'

    /* ── Guard: empty cart → /cart ────────── */
    useEffect(() => {
        if (!authLoading && isLoggedIn && cartState.cartArray.length === 0) {
            router.replace('/cart')
        }
    }, [authLoading, isLoggedIn, cartState.cartArray.length, router])

    /* ── Addresses ───────────────────────── */
    const [addresses,      setAddresses]      = useState<CustomerAddress[]>([])
    const [selectedAddrId, setSelectedAddrId] = useState('')
    const [addrLoading,    setAddrLoading]    = useState(true)

    useEffect(() => {
        if (!token) return
        authService.getAddresses(token)
            .then(data => {
                setAddresses(data)
                const def = data.find(a => a.is_default) ?? data[0]
                if (def) setSelectedAddrId(def.id)
            })
            .catch(err => console.error('addresses:', err))
            .finally(() => setAddrLoading(false))
    }, [token])

    /* ── Shipping ────────────────────────── */
    const [shipType, setShipType] = useState<'inside' | 'outside'>(
        urlShipType === 'outside' ? 'outside' : 'inside'
    )

    const subtotal = cartState.cartArray.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    )

    const FREE_SHIP_AT = 10000
    const shipFee = subtotal >= FREE_SHIP_AT ? 0
        : shipType === 'inside' ? SHIP_INSIDE : SHIP_OUTSIDE

    /* ── Coupon ──────────────────────────── */
    const [couponCode,    setCouponCode]    = useState('')
    const [couponResult,  setCouponResult]  = useState<CouponResult | null>(null)
    const [couponError,   setCouponError]   = useState('')
    const [couponLoading, setCouponLoading] = useState(false)

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!couponCode.trim()) return
        setCouponError('')
        setCouponLoading(true)
        try {
            const result = await ordersService.validateCoupon(couponCode, subtotal)
            setCouponResult(result)
        } catch (err: any) {
            setCouponError(err?.message || 'Invalid coupon code.')
            setCouponResult(null)
        } finally {
            setCouponLoading(false)
        }
    }

    const handleRemoveCoupon = () => {
        setCouponResult(null)
        setCouponCode('')
        setCouponError('')
    }

    /* ── Totals ──────────────────────────── */
    const discount = couponResult?.discount ?? 0
    const total    = Math.max(0, subtotal - discount + shipFee)

    /* ── Payment + note ──────────────────── */
    const [paymentMethod, setPaymentMethod] = useState('cod')
    const [note,          setNote]          = useState('')

    /* ── Submit ──────────────────────────── */
    const [submitting,  setSubmitting]  = useState(false)
    const [submitError, setSubmitError] = useState('')

    const handlePlaceOrder = async () => {
        if (!token) return
        if (!selectedAddrId) { setSubmitError('Please select a shipping address.'); return }

        setSubmitError('')
        setSubmitting(true)

        try {
            const items = await resolveCartItems(cartState.cartArray)
            if (!items) {
                setSubmitError('Could not resolve product variants. Please go back to cart and re-add items.')
                return
            }

            await ordersService.placeOrder(token, {
                shipping_address_id: selectedAddrId,
                items,
                coupon_code:  couponResult?.coupon.code,
                shipping_fee: shipFee,
                notes:        note.trim() || undefined,
            })

            cartState.cartArray.forEach(item => removeFromCart(item.id))

            window.location.href = '/my-account#orders'

        } catch (err: any) {
            setSubmitError(err?.message || 'Failed to place order. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (authLoading || !user) {
        return <Loading fullScreen />
    }

    return (
        <>
            <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
            <div id="header" className='relative w-full'>
                <MenuOne props="bg-transparent" />
                <Breadcrumb heading='Checkout' subHeading='Checkout' />
            </div>

            <div className="cart-block md:py-20 py-10">
                <div className="container">
                    <div className="content-main flex justify-between max-lg:flex-col gap-y-8 gap-x-10">

                        {/* ── Left: Info + Payment ──────────── */}
                        <div className="lg:w-3/5 w-full">

                            {/* Customer info */}
                            <div className="heading5 mb-3">Customer</div>
                            <div className="bg-surface p-4 rounded-xl caption1 mb-8">
                                <div className="font-semibold text-title">{user.name}</div>
                                <div className="text-secondary mt-1">{user.email} · {user.phone}</div>
                            </div>

                            {/* Shipping address */}
                            <div className="heading5 mb-3">Shipping Address</div>
                            {addrLoading ? (
                                <div className="caption1 text-secondary mb-8">Loading addresses...</div>
                            ) : addresses.length === 0 ? (
                                <div className="bg-surface p-4 rounded-xl mb-8">
                                    <p className="caption1 text-secondary mb-3">No saved addresses.</p>
                                    <Link href="/my-account#address" className="button-main bg-black text-sm px-4 py-2 inline-block">Add Address</Link>
                                </div>
                            ) : (
                                <div className="space-y-3 mb-8">
                                    {addresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            className={`p-4 border rounded-xl cursor-pointer duration-200 ${selectedAddrId === addr.id ? 'border-black bg-surface' : 'border-line hover:border-black'}`}
                                            onClick={() => setSelectedAddrId(addr.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    checked={selectedAddrId === addr.id}
                                                    onChange={() => setSelectedAddrId(addr.id)}
                                                    className="mt-1 flex-shrink-0"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-button">{addr.recipient_name}</span>
                                                        {addr.is_default && <span className="caption2 bg-black text-white px-2 py-0.5 rounded">Default</span>}
                                                    </div>
                                                    <div className="caption1 text-secondary mt-1">{addr.phone}</div>
                                                    <div className="caption1 mt-1">
                                                        {addr.address_line_1}
                                                        {addr.address_line_2 && `, ${addr.address_line_2}`}
                                                    </div>
                                                    <div className="caption1">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postal_code}, {addr.country}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Link href="/my-account" className="caption1 text-secondary hover:text-black duration-200 underline block mt-1">
                                        + Manage addresses
                                    </Link>
                                </div>
                            )}

                            {/* Payment method */}
                            <div className="heading5 mb-3">Payment Method</div>
                            <div className="space-y-3 mb-8">
                                {PAYMENT_METHODS.map(method => (
                                    <div
                                        key={method.value}
                                        className={`p-4 border rounded-xl cursor-pointer duration-200 ${paymentMethod === method.value ? 'border-black bg-surface' : 'border-line hover:border-black'}`}
                                        onClick={() => setPaymentMethod(method.value)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                checked={paymentMethod === method.value}
                                                onChange={() => setPaymentMethod(method.value)}
                                                className="flex-shrink-0"
                                            />
                                            <div>
                                                <div className="text-button">{method.label}</div>
                                                <div className="caption1 text-secondary mt-0.5">{method.desc}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Note */}
                            <div className="heading5 mb-3">
                                Order Note <span className="caption1 text-secondary font-normal">(optional)</span>
                            </div>
                            <textarea
                                rows={3}
                                placeholder="Special instructions for your order..."
                                className="border border-line px-4 py-3 w-full rounded-lg caption1 resize-none mb-8"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                            />

                        </div>

                        {/* ── Right: Coupon + Summary ───────── */}
                        <div className="lg:w-2/5 w-full">
                            <div className="sticky top-24 space-y-5">

                                {/* Coupon */}
                                <div className="bg-surface p-5 rounded-2xl">
                                    <div className="heading6 mb-3">Apply Coupon</div>
                                    <form onSubmit={handleApplyCoupon} className="relative h-11">
                                        <input
                                            type="text"
                                            placeholder="Enter coupon code"
                                            className="w-full h-full bg-white pl-4 pr-28 rounded-lg border border-line uppercase caption1"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                            disabled={!!couponResult}
                                        />
                                        {couponResult ? (
                                            <button
                                                type="button"
                                                className="absolute top-1 bottom-1 right-1 px-4 rounded-lg bg-red text-white caption1 font-semibold"
                                                onClick={handleRemoveCoupon}
                                            >Remove</button>
                                        ) : (
                                            <button
                                                type="submit"
                                                className="absolute top-1 bottom-1 right-1 px-4 rounded-lg bg-black text-white caption1 font-semibold"
                                                disabled={couponLoading}
                                            >
                                                {couponLoading ? '...' : 'Apply'}
                                            </button>
                                        )}
                                    </form>
                                    {couponError && <p className="caption2 text-red mt-2">{couponError}</p>}
                                    {couponResult && (
                                        <p className="caption2 text-success mt-2">
                                            ✓ <strong>{couponResult.coupon.code}</strong> — saving ৳{couponResult.discount.toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                {/* Order summary */}
                                <div className="checkout-block bg-surface p-5 rounded-2xl">
                                    <div className="heading5 mb-4">Order Summary</div>

                                    {/* Items */}
                                    <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                                        {cartState.cartArray.map(product => (
                                            <div key={product.id} className="flex items-center gap-3">
                                                <div className="w-14 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden bg-white">
                                                    <Image
                                                        src={product.thumbImage[0]}
                                                        width={140}
                                                        height={180}
                                                        alt={product.name}
                                                        className='w-full h-full object-cover'
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-button text-sm line-clamp-1">{product.name}</div>
                                                    <div className="caption2 text-secondary mt-0.5">
                                                        {product.selectedColor && <span className='capitalize'>{product.selectedColor}</span>}
                                                        {product.selectedColor && product.selectedSize && <span> / </span>}
                                                        {product.selectedSize && <span>{product.selectedSize}</span>}
                                                    </div>
                                                </div>
                                                <div className="caption1 flex-shrink-0 text-right">
                                                    <span className="text-secondary">{product.quantity}×</span>
                                                    <br />৳{product.price.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-line pt-4 space-y-3">
                                        {/* Subtotal */}
                                        <div className="flex justify-between caption1">
                                            <span className="text-secondary">Subtotal</span>
                                            <span>৳{subtotal.toLocaleString()}</span>
                                        </div>

                                        {/* Coupon discount */}
                                        {couponResult && (
                                            <div className="flex justify-between caption1">
                                                <span className="text-secondary">Coupon ({couponResult.coupon.code})</span>
                                                <span className="text-red">-৳{couponResult.discount.toLocaleString()}</span>
                                            </div>
                                        )}

                                        {/* Shipping selection */}
                                        <div className="border-t border-line pt-3">
                                            <div className="caption1 text-secondary mb-2">Delivery Location</div>
                                            <div className="space-y-2">
                                                <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer duration-200 ${subtotal >= FREE_SHIP_AT ? 'border-black bg-white' : 'border-line opacity-50 cursor-not-allowed'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <input type="radio" name="checkout-ship" disabled={subtotal < FREE_SHIP_AT} checked={subtotal >= FREE_SHIP_AT} readOnly />
                                                        <span className="caption2">Free (≥৳10,000)</span>
                                                    </div>
                                                    <span className="caption2 font-semibold text-success">৳0</span>
                                                </label>
                                                <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer duration-200 ${shipType === 'inside' && subtotal < FREE_SHIP_AT ? 'border-black bg-white' : 'border-line'} ${subtotal >= FREE_SHIP_AT ? 'opacity-50' : ''}`}>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name="checkout-ship"
                                                            disabled={subtotal >= FREE_SHIP_AT}
                                                            checked={shipType === 'inside' && subtotal < FREE_SHIP_AT}
                                                            onChange={() => setShipType('inside')}
                                                        />
                                                        <span className="caption2">Inside Chittagong</span>
                                                    </div>
                                                    <span className="caption2 font-semibold">৳{SHIP_INSIDE}</span>
                                                </label>
                                                <label className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer duration-200 ${shipType === 'outside' && subtotal < FREE_SHIP_AT ? 'border-black bg-white' : 'border-line'} ${subtotal >= FREE_SHIP_AT ? 'opacity-50' : ''}`}>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name="checkout-ship"
                                                            disabled={subtotal >= FREE_SHIP_AT}
                                                            checked={shipType === 'outside' && subtotal < FREE_SHIP_AT}
                                                            onChange={() => setShipType('outside')}
                                                        />
                                                        <span className="caption2">Outside Chittagong</span>
                                                    </div>
                                                    <span className="caption2 font-semibold">৳{SHIP_OUTSIDE}</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Shipping fee line */}
                                        <div className="flex justify-between caption1 border-t border-line pt-3">
                                            <span className="text-secondary">Shipping</span>
                                            <span>{shipFee === 0 ? <span className="text-success">Free</span> : `৳${shipFee}`}</span>
                                        </div>

                                        {/* Grand total */}
                                        <div className="flex justify-between heading5 pt-3 border-t border-line">
                                            <span>Total</span>
                                            <span>৳{total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                </div>
                                {/* Error */}
                                {submitError && (
                                    <div className="p-3 bg-red/5 border border-red/20 rounded-lg caption1 text-red mb-4">
                                        {submitError}
                                    </div>
                                )}

                                {/* Place order */}
                                <button
                                    className="button-main bg-black w-full text-center"
                                    onClick={handlePlaceOrder}
                                    disabled={submitting || !selectedAddrId || addresses.length === 0}
                                >
                                    {submitting ? 'Placing Order...' : `Place Order — ৳${total.toLocaleString()}`}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}

export default LoggedInCheckout