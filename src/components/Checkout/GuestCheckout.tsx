"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { useCart } from "@/context/CartContext";
import { ordersService, resolveCartItems } from "@/services/orders";
import type { CouponResult } from "@/type/Order";
import ModalPaymentInfo from "@/components/Modal/ModalPaymentInfo";

const SHIP_INSIDE = 80;
const SHIP_OUTSIDE = 120;
const FREE_SHIP_AT = 10000;

const GuestCheckout = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartState, removeFromCart } = useCart();

  const urlShipType = searchParams.get("ship_type") ?? "inside";

  /* ── Empty cart guard ────────────────── */
  useEffect(() => {
    if (cartState.cartArray.length === 0) router.replace("/cart");
  }, [cartState.cartArray.length, router]);

  /* ── Contact + address form ──────────── */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("Bangladesh");

  /* ── Shipping ────────────────────────── */
  const [shipType, setShipType] = useState<"inside" | "outside">(
    urlShipType === "outside" ? "outside" : "inside",
  );

  const subtotal = cartState.cartArray.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipFee =
    subtotal >= FREE_SHIP_AT
      ? 0
      : shipType === "inside"
        ? SHIP_INSIDE
        : SHIP_OUTSIDE;

  /* ── Coupon ──────────────────────────── */
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const result = await ordersService.validateCoupon(couponCode, subtotal);
      setCouponResult(result);
    } catch (err: any) {
      setCouponError(err?.message || "Invalid coupon code.");
      setCouponResult(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponResult(null);
    setCouponCode("");
    setCouponError("");
  };

  const discount = couponResult?.discount ?? 0;
  const total = Math.max(0, subtotal - discount + shipFee);

  /* ── Payment + note ──────────────────── */
  const [note, setNote] = useState("");
  const [isPaymentInfoOpen, setIsPaymentInfoOpen] = useState(false);

  /* ── Submit ──────────────────────────── */
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handlePlaceOrder = async () => {
    // Basic required-field check
    if (
      !name.trim() ||
      !phone.trim() ||
      !line1.trim() ||
      !city.trim() ||
      !country.trim()
    ) {
      setSubmitError("Please fill in your name, phone, and address.");
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      const items = await resolveCartItems(cartState.cartArray);
      if (!items) {
        setSubmitError(
          "Could not resolve product variants. Please go back to cart and re-add items.",
        );
        return;
      }

      await ordersService.placeGuestOrder({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: {
          recipient_name: name.trim(),
          phone: phone.trim(),
          address_line_1: line1.trim(),
          address_line_2: line2.trim() || undefined,
          city: city.trim(),
          state: state.trim() || undefined,
          postal_code: postal.trim() || undefined,
          country: country.trim(),
        },
        items,
        coupon_code: couponResult?.coupon.code,
        shipping_fee: shipFee,
        notes: note.trim() || undefined,
      });

      cartState.cartArray.forEach((item) => removeFromCart(item.variant_id));
      router.push("/"); // guest has no account page — send home
    } catch (err: any) {
      setSubmitError(
        err?.message || "Failed to place order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "border-line px-4 py-3 w-full rounded-lg caption1";

  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Checkout" subHeading="Checkout" />
      </div>

      <div className="cart-block md:py-10 py-10">
        <div className="container">
          <div className="content-main flex justify-between max-lg:flex-col gap-y-8 gap-x-10">
            {/* ── Left: Guest form ──────────────── */}
            <div className="lg:w-3/5 w-full">
              {/* Login prompt */}
              <div className="login bg-surface py-3 px-4 flex items-center justify-between rounded-lg mb-8">
                <span className="caption1 text-secondary">
                  Already have an account?
                </span>
                <Link href="/login" className="text-button hover-underline">
                  Login
                </Link>
              </div>
              {/* Contact */}
              <div className="heading5 mb-3">Your Information</div>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className={inputClass}
                  type="tel"
                  placeholder="Phone Number *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  className={`${inputClass} sm:col-span-2`}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Shipping address */}
              <div className="heading5 mb-3">Shipping Address</div>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <input
                  className={`${inputClass} sm:col-span-2`}
                  type="text"
                  placeholder="Street Address *"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                />
                <input
                  className={`${inputClass} sm:col-span-2`}
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                />
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Town/City *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  className={inputClass}
                  type="text"
                  placeholder="State/Division (optional)"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Postal Code (optional)"
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                />
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Country *"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              {/* Payment information */}
              <div className="mb-8">
                <div className="heading5 mb-3">Payment Information</div>
                <button
                  type="button"
                  onClick={() => setIsPaymentInfoOpen(true)}
                  className="w-full p-4 border border-line rounded-xl text-left duration-200 hover:border-black hover:bg-surface"
                >
                  <div className="text-button">View Payment Info</div>
                  <div className="caption1 text-secondary mt-1">
                    See bKash, Nagad, QR code, and bank transfer details.
                  </div>
                </button>
              </div>

              {/* Note */}
              <div className="heading5 mb-3">
                Order Note{" "}
                <span className="caption1 text-secondary font-normal">
                  (optional)
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Special instructions for your order..."
                className="border border-line px-4 py-3 w-full rounded-lg caption1 resize-none mb-8"
                value={note}
                onChange={(e) => setNote(e.target.value)}
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
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      disabled={!!couponResult}
                    />
                    {couponResult ? (
                      <button
                        type="button"
                        className="absolute top-1 bottom-1 right-1 px-4 rounded-lg bg-red text-white caption1 font-semibold"
                        onClick={handleRemoveCoupon}>
                        Remove
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="absolute top-1 bottom-1 right-1 px-4 rounded-lg bg-black text-white caption1 font-semibold"
                        disabled={couponLoading}>
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    )}
                  </form>
                  {couponError && (
                    <p className="caption2 text-red mt-2">{couponError}</p>
                  )}
                  {couponResult && (
                    <p className="caption2 text-success mt-2">
                      ✓ <strong>{couponResult.coupon.code}</strong> — saving ৳
                      {couponResult.discount.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Order summary */}
                <div className="checkout-block bg-surface p-5 rounded-2xl">
                  <div className="heading5 mb-4">Order Summary</div>

                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {cartState.cartArray.map((product) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="w-14 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden bg-white">
                          <Image
                            src={product.thumbImage[0]}
                            width={140}
                            height={180}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-button text-sm line-clamp-1">
                            {product.name}
                          </div>
                          <div className="caption2 text-secondary mt-0.5">
                            {product.selectedColor && (
                              <span className="capitalize">
                                {product.selectedColor}
                              </span>
                            )}
                            {product.selectedColor && product.selectedSize && (
                              <span> / </span>
                            )}
                            {product.selectedSize && (
                              <span>{product.selectedSize}</span>
                            )}
                          </div>
                        </div>
                        <div className="caption1 flex-shrink-0 text-right">
                          <span className="text-secondary">
                            {product.quantity}×
                          </span>
                          <br />৳{product.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-line pt-4 space-y-3">
                    <div className="flex justify-between caption1">
                      <span className="text-secondary">Subtotal</span>
                      <span>৳{subtotal.toLocaleString()}</span>
                    </div>

                    {couponResult && (
                      <div className="flex justify-between caption1">
                        <span className="text-secondary">
                          Coupon ({couponResult.coupon.code})
                        </span>
                        <span className="text-red">
                          -৳{couponResult.discount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Shipping selection */}
                    <div className="border-t border-line pt-3">
                      <div className="caption1 text-secondary mb-2">
                        Home Delivery Location
                      </div>
                      <div className="space-y-2">
                        <label
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer duration-200 ${subtotal >= FREE_SHIP_AT ? "border-black bg-white" : "border-line opacity-50 cursor-not-allowed"}`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="guest-ship"
                              disabled={subtotal < FREE_SHIP_AT}
                              checked={subtotal >= FREE_SHIP_AT}
                              readOnly
                            />
                            <span className="caption2">Free (≥৳10,000)</span>
                          </div>
                          <span className="caption2 font-semibold text-success">
                            ৳0
                          </span>
                        </label>
                        <label
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer duration-200 ${shipType === "inside" && subtotal < FREE_SHIP_AT ? "border-black bg-white" : "border-line"} ${subtotal >= FREE_SHIP_AT ? "opacity-50" : ""}`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="guest-ship"
                              disabled={subtotal >= FREE_SHIP_AT}
                              checked={
                                shipType === "inside" && subtotal < FREE_SHIP_AT
                              }
                              onChange={() => setShipType("inside")}
                            />
                            <span className="caption2">Inside Chittagong</span>
                          </div>
                          <span className="caption2 font-semibold">
                            ৳{SHIP_INSIDE}
                          </span>
                        </label>
                        <label
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer duration-200 ${shipType === "outside" && subtotal < FREE_SHIP_AT ? "border-black bg-white" : "border-line"} ${subtotal >= FREE_SHIP_AT ? "opacity-50" : ""}`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="guest-ship"
                              disabled={subtotal >= FREE_SHIP_AT}
                              checked={
                                shipType === "outside" &&
                                subtotal < FREE_SHIP_AT
                              }
                              onChange={() => setShipType("outside")}
                            />
                            <span className="caption2">Outside Chittagong</span>
                          </div>
                          <span className="caption2 font-semibold">
                            ৳{SHIP_OUTSIDE}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-between caption1 border-t border-line pt-3">
                      <span className="text-secondary">Shipping</span>
                      <span>
                        {shipFee === 0 ? (
                          <span className="text-success">Free</span>
                        ) : (
                          `৳${shipFee}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between heading5 pt-3 border-t border-line">
                      <span>Total</span>
                      <span>৳{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 bg-red/5 border border-red/20 rounded-lg caption1 text-red mb-4">
                    {submitError}
                  </div>
                )}

                <button
                  className="button-main bg-black w-full text-center"
                  onClick={handlePlaceOrder}
                  disabled={submitting}>
                  {submitting
                    ? "Placing Order..."
                    : `Place Order — ৳${total.toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalPaymentInfo
        isOpen={isPaymentInfoOpen}
        onClose={() => setIsPaymentInfoOpen(false)}
      />

      <Footer />
    </>
  );
};

export default GuestCheckout;
