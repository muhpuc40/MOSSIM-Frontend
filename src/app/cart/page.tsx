"use client";
import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from "@/context/CartContext";
import { countdownTime } from "@/store/countdownTime";
import { getProductVariants } from "@/services/products";

const FREE_SHIP_AT = 10000;
const SHIP_INSIDE = 80;
const SHIP_OUTSIDE = 120;

const Cart = () => {
  const router = useRouter();
  const { cartState, updateQty, removeFromCart } = useCart();

  /* ── Countdown ───────────────────────── */
  const [timeLeft, setTimeLeft] = useState(countdownTime());
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(countdownTime()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── Totals ──────────────────────────── */
  const subtotal = cartState.cartArray.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  /* ── Shipping ────────────────────────── */
  const [shipType, setShipType] = useState<"inside" | "outside">("inside");

  const shipFee = useMemo(() => {
    if (cartState.cartArray.length === 0) return 0;
    if (subtotal >= FREE_SHIP_AT) return 0;
    return shipType === "inside" ? SHIP_INSIDE : SHIP_OUTSIDE;
  }, [subtotal, shipType, cartState.cartArray.length]);

  const total = subtotal + shipFee;

  /* ── SKU resolver ────────────────────── */
  const getVariantSku = (
    productId: string,
    color: string,
    size: string,
  ): string => {
    const variants = getProductVariants(productId);
    const variant =
      variants.find(
        (v) => v.color?.color_name === color && v.size?.size_label === size,
      ) ??
      variants.find((v) => v.is_default) ??
      variants[0];
    return variant?.sku ?? "";
  };

  /* ── Qty handler ─────────────────────── */
  const handleQty = (id: string, qty: number, size: string, color: string) => {
    if (qty < 1) return;
    // updateQty(product.variant_id, newQty);
    updateQty(id, qty);
  };

  const goToCheckout = () => {
    router.push(`/checkout?ship=${shipFee}&ship_type=${shipType}`);
  };

  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Shopping Cart" subHeading="Shopping Cart" />
      </div>

      <div className="cart-block md:py-20 py-10">
        <div className="container">
          <div className="content-main flex justify-between max-xl:flex-col gap-y-8">
            {/* ── Left ──────────────────────────── */}
            <div className="xl:w-2/3 xl:pr-3 w-full">
              {/* Free shipping progress */}
              <div className="heading banner mt-5">
                <div className="text">
                  {subtotal >= FREE_SHIP_AT ? (
                    <span className="text-success font-semibold">
                      🎉 Youve unlocked free shipping!
                    </span>
                  ) : (
                    <>
                      Buy
                      <span className="text-button">
                        {" "}
                        ৳{(FREE_SHIP_AT - subtotal).toLocaleString()}{" "}
                      </span>
                      more to get
                      <span className="text-button"> free shipping</span>
                    </>
                  )}
                </div>
                <div className="tow-bar-block mt-4">
                  <div
                    className="progress-line"
                    style={{
                      width: `${Math.min((subtotal / FREE_SHIP_AT) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Products table */}
              <div className="list-product w-full sm:mt-7 mt-5">
                <div className="w-full">
                  <div className="heading bg-surface bora-4 pt-4 pb-4">
                    <div className="flex">
                      <div className="w-1/2">
                        <div className="text-button text-center">Products</div>
                      </div>
                      <div className="w-1/12">
                        <div className="text-button text-center">Price</div>
                      </div>
                      <div className="w-1/6">
                        <div className="text-button text-center">Quantity</div>
                      </div>
                      <div className="w-1/6">
                        <div className="text-button text-center">Total</div>
                      </div>
                    </div>
                  </div>

                  <div className="list-product-main w-full mt-3">
                    {cartState.cartArray.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-secondary caption1 mb-4">
                          Your cart is empty
                        </p>
                        <Link
                          href="/shop"
                          className="button-main bg-black inline-block">
                          Shop Now
                        </Link>
                      </div>
                    ) : (
                      cartState.cartArray.map((product) => {
                        const sku = product.variant_sku;

                        return (
                          <div
                            key={product.variant_id}
                            className="item flex md:mt-7 md:pb-7 mt-5 pb-5 border-b border-line w-full">
                            {/* Product info */}
                            <div className="w-1/2">
                              <div className="flex items-center gap-6">
                                <div className="bg-img md:w-[100px] w-20 aspect-[3/4] flex-shrink-0">
                                  <Image
                                    src={product.thumbImage[0]}
                                    width={1000}
                                    height={1000}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                </div>
                                <div>
                                  <div className="text-title">
                                    {product.name}
                                  </div>
                                  {sku && (
                                    <div className="caption2 text-secondary mt-1 font-mono">
                                      SKU: {sku}
                                    </div>
                                  )}
                                  <div className="caption1 text-secondary mt-1.5">
                                    {product.selectedColor && (
                                      <span className="capitalize">
                                        {product.selectedColor}
                                      </span>
                                    )}
                                    {product.selectedColor &&
                                      product.selectedSize && <span> / </span>}
                                    {product.selectedSize && (
                                      <span className="uppercase">
                                        {product.selectedSize}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="w-1/12 flex items-center justify-center">
                              <div className="text-title text-center">
                                ৳{product.price.toLocaleString()}
                              </div>
                            </div>

                            {/* Qty */}
                            <div className="w-1/6 flex items-center justify-center">
                              <div className="quantity-block bg-surface md:p-3 p-2 flex items-center justify-between rounded-lg border border-line md:w-[100px] flex-shrink-0 w-20">
                                <Icon.Minus
                                  className={`text-base max-md:text-sm cursor-pointer ${product.quantity === 1 ? "opacity-30" : ""}`}
                                  onClick={() =>
                                    handleQty(
                                      product.id,
                                      product.quantity - 1,
                                      product.selectedSize,
                                      product.selectedColor,
                                    )
                                  }
                                />
                                <div className="text-button">
                                  {product.quantity}
                                </div>
                                <Icon.Plus
                                  className="text-base max-md:text-sm cursor-pointer"
                                  onClick={() =>
                                    handleQty(
                                      product.id,
                                      product.quantity + 1,
                                      product.selectedSize,
                                      product.selectedColor,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {/* Line total */}
                            <div className="w-1/6 flex items-center justify-center">
                              <div className="text-title text-center">
                                ৳
                                {(
                                  product.quantity * product.price
                                ).toLocaleString()}
                              </div>
                            </div>

                            {/* Remove */}
                            <div className="w-1/12 flex items-center justify-center">
                              <Icon.XCircle
                                className="text-xl max-md:text-base text-red cursor-pointer hover:text-black duration-300"
                                onClick={() =>
                                  removeFromCart(product.variant_id)
                                }
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Order Summary ───────────── */}
            <div className="xl:w-1/3 xl:pl-12 w-full">
              <div className="checkout-block bg-surface p-6 rounded-2xl">
                <div className="heading5 mb-5">Order Summary</div>

                {/* Subtotal */}
                <div className="total-block py-4 flex justify-between border-b border-line">
                  <div className="text-title">Subtotal</div>
                  <div className="text-title">৳{subtotal.toLocaleString()}</div>
                </div>

                {/* Shipping selection */}
                <div className="ship-block py-4 border-b border-line">
                  <div className="text-title mb-3">Shipping</div>
                  <div className="space-y-2">
                    {/* Free shipping */}
                    <label
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer duration-200 ${subtotal >= FREE_SHIP_AT ? "border-black bg-white" : "border-line opacity-40 cursor-not-allowed"}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="ship"
                          disabled={subtotal < FREE_SHIP_AT}
                          checked={subtotal >= FREE_SHIP_AT}
                          readOnly
                        />
                        <span className="caption1">Free Shipping</span>
                      </div>
                      <span className="caption1 font-semibold text-success">
                        ৳0
                      </span>
                    </label>

                    {/* Inside Chittagong */}
                    <label
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer duration-200 ${shipType === "inside" && subtotal < FREE_SHIP_AT ? "border-black bg-white" : "border-line"} ${subtotal >= FREE_SHIP_AT ? "opacity-50" : ""}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="ship"
                          disabled={subtotal >= FREE_SHIP_AT}
                          checked={
                            shipType === "inside" && subtotal < FREE_SHIP_AT
                          }
                          onChange={() => setShipType("inside")}
                        />
                        <span className="caption1">Inside Chittagong</span>
                      </div>
                      <span className="caption1 font-semibold">
                        ৳{SHIP_INSIDE}
                      </span>
                    </label>

                    {/* Outside Chittagong */}
                    <label
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer duration-200 ${shipType === "outside" && subtotal < FREE_SHIP_AT ? "border-black bg-white" : "border-line"} ${subtotal >= FREE_SHIP_AT ? "opacity-50" : ""}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="ship"
                          disabled={subtotal >= FREE_SHIP_AT}
                          checked={
                            shipType === "outside" && subtotal < FREE_SHIP_AT
                          }
                          onChange={() => setShipType("outside")}
                        />
                        <span className="caption1">Outside Chittagong</span>
                      </div>
                      <span className="caption1 font-semibold">
                        ৳{SHIP_OUTSIDE}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Total */}
                <div className="total-cart-block pt-4 pb-4 flex justify-between border-b border-line">
                  <div className="heading5">Total</div>
                  <div className="heading5">৳{total.toLocaleString()}</div>
                </div>

                {/* CTA */}
                <div className="block-button flex flex-col items-center gap-y-4 mt-5">
                  <div
                    className={`checkout-btn button-main bg-black text-center w-full ${cartState.cartArray.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    onClick={
                      cartState.cartArray.length > 0 ? goToCheckout : undefined
                    }>
                    Proceed To Checkout
                  </div>
                  <Link className="text-button hover-underline" href="/shop">
                    Continue shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Cart;
