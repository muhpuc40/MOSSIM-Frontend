"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useModalCartContext } from "@/context/ModalCartContext";
import { useCart } from "@/context/CartContext";
import { getProductVariants } from "@/services/products";

const ModalCart = () => {
  const [activeTab, setActiveTab] = useState<string>("");
  const { isModalOpen, closeModalCart } = useModalCartContext();
  const { cartState, removeFromCart, updateCart } = useCart();

  const totalCart = cartState.cartArray.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="modal-cart-block" onClick={closeModalCart}>
      <div
        className={`modal-cart-main flex ${isModalOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}>
        <div className="right cart-block w-full pt-6 relative overflow-hidden flex flex-col h-full">
          {/* ── Header ── */}
          <div className="heading px-6 pb-3 flex items-center justify-between border-b border-line flex-shrink-0">
            <div className="heading5">
              Shopping Cart
              <span className="ml-2 caption1 text-secondary font-normal">
                ({cartState.cartArray.length}{" "}
                {cartState.cartArray.length === 1 ? "item" : "items"})
              </span>
            </div>
            <div
              className="close-btn w-8 h-8 rounded-full bg-surface flex items-center justify-center duration-300 cursor-pointer hover:bg-black hover:text-white"
              onClick={closeModalCart}>
              <Icon.X size={14} />
            </div>
          </div>

          {/* ── Scrollable list ── */}
          <div className="list-product px-6 overflow-y-auto flex-1">
            {cartState.cartArray.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-secondary py-20">
                <Icon.ShoppingCart size={44} className="opacity-25" />
                <p className="body2">Your cart is empty</p>
              </div>
            ) : (
              cartState.cartArray.map((product) => (
                <CartItem
                  key={product.id}
                  product={product}
                  onRemove={() => removeFromCart(product.id)}
                  onUpdate={(qty, size, color) =>
                    updateCart(product.id, qty, size, color)
                  }
                />
              ))
            )}
          </div>

          {/* ── Footer (attached to bottom, no gap) ── */}
          <div className="footer-modal bg-white flex-shrink-0">
            {/* Note / Coupon triggers */}
            <div className="flex items-center justify-center gap-10 px-6 py-3 border-t border-b border-line">
              <button
                className="flex items-center gap-2 text-secondary hover:text-black transition-colors"
                onClick={() =>
                  setActiveTab(activeTab === "note" ? "" : "note")
                }>
                <Icon.NotePencil size={18} />
                <span className="caption1">Note</span>
              </button>
              {/* <button
                                className="flex items-center gap-2 text-secondary hover:text-black transition-colors"
                                onClick={() => setActiveTab(activeTab === 'coupon' ? '' : 'coupon')}
                            >
                                <Icon.Tag size={18} />
                                <span className="caption1">Coupon</span>
                            </button> */}
            </div>

            {/* Subtotal - directly attached, no extra padding */}
            <div className="flex items-center justify-between px-6 pt-4">
              <div className="heading5">Subtotal</div>
              <div className="heading5">${totalCart.toFixed(2)}</div>
            </div>

            {/* CTA Buttons */}
            <div className="block-button px-6 pt-4 pb-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Link
                  href="/cart"
                  className="button-main basis-1/2 bg-white border border-black text-black text-center uppercase"
                  onClick={closeModalCart}>
                  View cart
                </Link>
                <Link
                  href="/checkout"
                  className="button-main basis-1/2 text-center uppercase"
                  onClick={closeModalCart}>
                  Checkout
                </Link>
              </div>
              <div
                onClick={closeModalCart}
                className="text-button-uppercase text-center has-line-before cursor-pointer inline-block self-center">
                Continue shopping
              </div>
            </div>

            {/* Tab: Note */}
            <div className={`tab-item ${activeTab === "note" ? "active" : ""}`}>
              <div className="px-6 py-4 border-b border-line flex items-center gap-3">
                <Icon.NotePencil size={18} />
                <span className="caption1 font-semibold">Order Note</span>
              </div>
              <div className="px-6 pt-4">
                <textarea
                  rows={4}
                  placeholder="Add special instructions for your order..."
                  className="caption1 py-3 px-4 bg-surface border border-line rounded-md w-full resize-none"
                />
              </div>
              <div className="block-button px-6 pt-4 pb-6 flex flex-col gap-3">
                <button
                  className="button-main w-full text-center"
                  onClick={() => setActiveTab("")}>
                  Save
                </button>
                <div
                  onClick={() => setActiveTab("")}
                  className="text-button-uppercase text-center has-line-before cursor-pointer inline-block self-center">
                  Cancel
                </div>
              </div>
            </div>

            {/* Tab: Coupon */}
            {/* <div
              className={`tab-item ${activeTab === "coupon" ? "active" : ""}`}>
              <div className="px-6 py-4 border-b border-line flex items-center gap-3">
                <Icon.Tag size={18} />
                <span className="caption1 font-semibold">
                  Add a Coupon Code
                </span>
              </div>
              <div className="px-6 pt-4">
                <label
                  htmlFor="coupon-code"
                  className="caption1 text-secondary">
                  Enter Code
                </label>
                <input
                  id="coupon-code"
                  type="text"
                  placeholder="Discount code"
                  className="border border-line px-5 py-3 w-full rounded-xl mt-2 caption1"
                />
              </div>
              <div className="block-button px-6 pt-4 pb-6 flex flex-col gap-3">
                <button
                  className="button-main w-full text-center"
                  onClick={() => setActiveTab("")}>
                  Apply
                </button>
                <div
                  onClick={() => setActiveTab("")}
                  className="text-button-uppercase text-center has-line-before cursor-pointer inline-block self-center">
                  Cancel
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   CartItem Component
──────────────────────────────────────────────────────────── */
interface CartItemProps {
  product: any;
  onRemove: () => void;
  onUpdate: (qty: number, size: string, color: string) => void;
}

const CartItem = ({ product, onRemove, onUpdate }: CartItemProps) => {
  const variants = useMemo(() => getProductVariants(product.id), [product.id]);

  const [selectedColor, setSelectedColor] = useState<string>(
    product.selectedColor || product.variation?.[0]?.color || "",
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.selectedSize || product.sizes?.[0] || "",
  );
  const [qty, setQty] = useState<number>(product.quantity || 1);

  const availableSizes = useMemo<string[]>(() => {
    if (!variants.length) return product.sizes as string[];
    return variants
      .filter((v: any) => v.color?.color_name === selectedColor)
      .map((v: any) => v.size?.size_label)
      .filter(Boolean) as string[];
  }, [selectedColor, variants, product.sizes]);

  const handleColorChange = (color: string) => {
    const sizes = variants
      .filter((v: any) => v.color?.color_name === color)
      .map((v: any) => v.size?.size_label)
      .filter(Boolean) as string[];
    const nextSize = sizes[0] || selectedSize;
    setSelectedColor(color);
    setSelectedSize(nextSize);
    onUpdate(qty, nextSize, color);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    onUpdate(qty, size, selectedColor);
  };

  const handleIncrease = () => {
    const next = qty + 1;
    setQty(next);
    onUpdate(next, selectedSize, selectedColor);
  };

  const handleDecrease = () => {
    if (qty <= 1) return;
    const next = qty - 1;
    setQty(next);
    onUpdate(next, selectedSize, selectedColor);
  };

  return (
    <div className="item py-4 border-b border-line">
      {/* DESKTOP LAYOUT */}
      <div className="max-md:hidden flex items-center w-full">
        {/* Thumbnail */}
        <div
          className="bg-img flex-shrink-0 rounded-lg overflow-hidden mr-3"
          style={{ width: 80, height: 100 }}>
          <Image
            src={product.images[0]}
            width={160}
            height={200}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name + Price */}
        <div
          className="flex-shrink-0 flex flex-col gap-0.5 mr-3"
          style={{ width: 170 }}>
          <div className="text-button line-clamp-2 leading-snug">
            {product.name}
          </div>
          <div className="text-title font-semibold">${product.price}.00</div>
        </div>

        {/* Colors */}
        <div
          className="flex-shrink-0 flex flex-col gap-1 mr-3"
          style={{ width: 130 }}>
          <span className="caption2 text-secondary">Color</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.variation?.map((v: any, i: number) => (
              <button
                key={i}
                title={v.color}
                onClick={() => handleColorChange(v.color)}
                style={{ backgroundColor: v.colorCode }}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                  selectedColor === v.color
                    ? "border-black scale-110"
                    : "border-line hover:border-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Sizes - wider */}
        <div
          className="flex-shrink-0 flex flex-col gap-1 mr-3"
          style={{ width: 190 }}>
          <span className="caption2 text-secondary">Size</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(product.sizes as string[])?.map((size, i) => {
              const available = availableSizes.includes(size);
              return (
                <button
                  key={i}
                  disabled={!available}
                  onClick={() => available && handleSizeChange(size)}
                  className={`min-w-[36px] h-8 px-2 flex items-center justify-center caption2 rounded-md border transition-all duration-200 ${
                    !available
                      ? "opacity-30 cursor-not-allowed line-through border-line text-secondary"
                      : selectedSize === size
                        ? "border-black bg-black text-white font-medium"
                        : "border-line hover:border-black cursor-pointer"
                  }`}>
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center ml-auto flex-shrink-0">
          <div className="flex flex-col gap-1">
            <span className="caption2 text-secondary">Quantity</span>
            <div className="quantity-block flex items-center border border-line rounded-lg overflow-hidden">
              <button
                onClick={handleDecrease}
                disabled={qty <= 1}
                className="w-9 h-9 flex items-center justify-center text-secondary hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <Icon.Minus size={12} weight="bold" />
              </button>
              <span className="body1 font-semibold w-9 h-9 flex items-center justify-center border-x border-line text-center">
                {qty}
              </span>
              <button
                onClick={handleIncrease}
                className="w-9 h-9 flex items-center justify-center text-secondary hover:bg-black hover:text-white transition-colors">
                <Icon.Plus size={12} weight="bold" />
              </button>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="remove-cart-btn caption1 font-semibold text-red underline cursor-pointer ml-3 self-center"
            style={{ marginTop: "12px" }}>
            Remove
          </button>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="md:hidden flex items-start gap-4">
        <div className="bg-img w-[80px] h-[100px] flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={product.images[0]}
            width={200}
            height={260}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="text-button line-clamp-2 leading-snug">
              {product.name}
            </div>
            <button
              onClick={onRemove}
              className="remove-cart-btn caption1 font-semibold text-red underline cursor-pointer flex-shrink-0">
              Remove
            </button>
          </div>
          <div className="text-title font-semibold">${product.price}.00</div>
          {product.variation && product.variation.length > 0 && (
            <div>
              <p className="caption2 text-secondary mb-1">
                Color:{" "}
                <span className="text-black font-semibold">
                  {selectedColor}
                </span>
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {product.variation.map((v: any, i: number) => (
                  <button
                    key={i}
                    title={v.color}
                    onClick={() => handleColorChange(v.color)}
                    style={{ backgroundColor: v.colorCode }}
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                      selectedColor === v.color
                        ? "border-black scale-110"
                        : "border-line hover:border-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <p className="caption2 text-secondary mb-1">
                Size:{" "}
                <span className="text-black font-semibold">{selectedSize}</span>
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(product.sizes as string[]).map((size, i) => {
                  const available = availableSizes.includes(size);
                  return (
                    <button
                      key={i}
                      disabled={!available}
                      onClick={() => available && handleSizeChange(size)}
                      className={`min-w-[36px] h-8 px-2 flex items-center justify-center caption2 rounded-md border transition-all duration-200 ${
                        !available
                          ? "opacity-30 cursor-not-allowed line-through border-line"
                          : selectedSize === size
                            ? "border-black bg-black text-white"
                            : "border-line hover:border-black cursor-pointer"
                      }`}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="quantity-block flex items-center border border-line rounded-lg overflow-hidden w-fit">
            <button
              onClick={handleDecrease}
              disabled={qty <= 1}
              className="w-9 h-9 flex items-center justify-center text-secondary hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <Icon.Minus size={12} />
            </button>
            <span className="body1 font-semibold w-9 h-9 flex items-center justify-center border-x border-line text-center">
              {qty}
            </span>
            <button
              onClick={handleIncrease}
              className="w-9 h-9 flex items-center justify-center text-secondary hover:bg-black hover:text-white transition-colors">
              <Icon.Plus size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCart;
