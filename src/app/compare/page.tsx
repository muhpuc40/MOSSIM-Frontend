"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { ProductType } from "@/type/ProductType";
import * as Icon from "@phosphor-icons/react/dist/ssr";

import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";
import { useModalCartContext } from "@/context/ModalCartContext";

const Compare = () => {
  const { compareState, removeFromCompare } = useCompare();
  const { cartState, addToCart, updateQty } = useCart();
  const { openModalCart } = useModalCartContext();

  const handleAddToCart = (productItem: ProductType) => {
    // Pick first available variant (compare page doesn't have a variant picker)
    const firstVariant = productItem.variation?.[0];
    const firstSize = productItem.sizes?.[0] || "";
    const firstColor = firstVariant?.color || "";

    // Build a variant_id — use the product's actual variant_id if present,
    // otherwise fall back to product.id (works for products without variants)
    const variantId = (productItem as any).variant_id || productItem.id;

    // Check if this variant is already in the cart
    const existing = cartState.cartArray.find(
      (item: any) => item.variant_id === variantId,
    );

    if (existing) {
      // Already in cart — just bump quantity by 1
      updateQty(variantId, existing.quantity + 1);
    } else {
      // New item — add to cart with sensible defaults
      addToCart({
        ...productItem,
        quantity: 1,
        selectedColor: firstColor,
        selectedSize: firstSize,
        variant_id: variantId,
        variant_sku: (productItem as any).variant_sku || "",
      } as any);
    }

    openModalCart();
  };

  const compareArray = compareState.compareArray;

  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Compare Products" subHeading="Compare Products" />
      </div>

      <div className="compare-block md:py-20 py-10">
        <div className="container">
          {/* ── Empty state ────────────────────────────── */}
          {compareArray.length === 0 ? (
            <div className="empty-compare flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-5">
                <Icon.ArrowsCounterClockwise
                  size={36}
                  className="text-secondary2"
                />
              </div>
              <div className="heading5 mb-2">No Products to Compare</div>
              <p className="text-secondary text-center max-w-md mb-6">
                Browse our collection and add products you&apos;d like to
                compare side-by-side.
              </p>
              <Link href="/shop" className="button-main bg-black text-white">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="content-main">
              {/* ── Top: Product images (smaller) ─────── */}
              <div className="list-product flex">
                <div className="left lg:w-[200px] w-[140px] flex-shrink-0 border-r border-line"></div>
                <div className="right flex w-full border border-line rounded-tr-2xl border-b-0 overflow-x-auto">
                  {compareArray.map((item) => (
                    <div
                      className="product-item px-4 pt-5 pb-4 border-r border-line min-w-[220px] flex-1 relative"
                      key={item.id}>
                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCompare(item.id)}
                        className="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red hover:text-white transition-colors"
                        aria-label="Remove from compare">
                        <Icon.X size={14} weight="bold" />
                      </button>

                      {/* Image carousel — smaller box, no arrows */}

                      <div className="bg-img w-full max-w-[160px] mx-auto aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 cursor-pointer">
                        {item.images && item.images.length > 1 ? (
                          <Swiper
                            modules={[Pagination, Autoplay]}
                            pagination={{ clickable: true }}
                            autoplay={{
                              delay: 3500,
                              disableOnInteraction: false,
                            }}
                            loop={item.images.length > 1}
                            className="w-full h-full compare-product-swiper">
                            {item.images.map((img, i) => (
                              <SwiperSlide key={i}>
                                <Image
                                  src={img}
                                  width={1000}
                                  height={1500}
                                  alt={`${item.name} image ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        ) : (
                          <Image
                            src={
                              item.images?.[0] ||
                              "/images/product/placeholder.png"
                            }
                            width={1000}
                            height={1500}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <Link href={`/product/details?id=${item.id}`}>
                        <div className="text-title text-center mt-3 text-sm hover:underline cursor-pointer">
                          {item.name}
                        </div>
                      </Link>
                      {item.brand && (
                        <div className="caption2 font-semibold text-secondary2 uppercase text-center mt-1 text-xs">
                          {item.brand}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Comparison table ──────────────────────── */}
              <div className="compare-table flex">
                {/* Left: Labels — vertical line divider on right */}
                <div className="left lg:w-[200px] w-[140px] flex-shrink-0 border border-line rounded-bl-2xl">
                  <div className="item text-button flex items-center h-[60px] px-6 w-full border-b border-line">
                    Price
                  </div>
                  <div className="item text-button flex items-center h-[60px] px-6 w-full border-b border-line">
                    Type
                  </div>
                  {compareArray.some((p) => p.brand) && (
                    <div className="item text-button flex items-center h-[60px] px-6 w-full border-b border-line">
                      Brand
                    </div>
                  )}
                  <div className="item text-button flex items-center h-[60px] px-6 w-full border-b border-line">
                    Sizes
                  </div>
                  <div className="item text-button flex items-center h-[60px] px-6 w-full border-b border-line">
                    Colors
                  </div>
                  <div className="item text-button flex items-center h-[60px] px-6 w-full border-b border-line">
                    Stock
                  </div>
                  <div className="item text-button flex items-center h-[60px] px-6 w-full">
                    Add To Cart
                  </div>
                </div>

                {/* Right: Product columns */}
                <div className="right flex w-full border-t border-r border-line rounded-br-2xl overflow-x-auto">
                  {compareArray.map((item) => (
                    <div
                      className="product-column flex-1 min-w-[220px] border-r border-line last:border-r-0"
                      key={item.id}>
                      {/* Price */}
                      <div className="h-[60px] border-b border-line flex items-center justify-center gap-2">
                        <span className="font-semibold">৳{item.price}</span>
                        {item.originPrice && item.originPrice > item.price && (
                          <del className="text-secondary2 text-sm">
                            ৳{item.originPrice}
                          </del>
                        )}
                      </div>

                      {/* Type */}
                      <div className="h-[60px] border-b border-line flex items-center justify-center capitalize">
                        {item.type || "—"}
                      </div>

                      {/* Brand (only show row if any product has brand) */}
                      {compareArray.some((p) => p.brand) && (
                        <div className="h-[60px] border-b border-line flex items-center justify-center capitalize">
                          {item.brand || "—"}
                        </div>
                      )}

                      {/* Sizes */}
                      <div className="h-[60px] border-b border-line flex items-center justify-center gap-1 px-3 flex-wrap">
                        {item.sizes && item.sizes.length > 0 ? (
                          item.sizes.map((size, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 border border-line rounded uppercase">
                              {size}
                            </span>
                          ))
                        ) : (
                          <span className="text-secondary2">—</span>
                        )}
                      </div>

                      {/* Colors */}
                      <div className="h-[60px] border-b border-line flex items-center justify-center gap-2">
                        {item.variation && item.variation.length > 0 ? (
                          item.variation.map((colorItem, i) => (
                            <span
                              key={i}
                              className="w-6 h-6 rounded-full border border-line"
                              style={{ backgroundColor: colorItem.colorCode }}
                              title={colorItem.color}></span>
                          ))
                        ) : (
                          <span className="text-secondary2">—</span>
                        )}
                      </div>

                      {/* Stock */}
                      <div className="h-[60px] border-b border-line flex items-center justify-center">
                        {item.sold !== undefined &&
                        item.quantity !== undefined ? (
                          item.quantity - item.sold > 0 ? (
                            <span className="text-success text-sm font-semibold">
                              In Stock
                            </span>
                          ) : (
                            <span className="text-red text-sm font-semibold">
                              Out of Stock
                            </span>
                          )
                        ) : (
                          <span className="text-success text-sm font-semibold">
                            Available
                          </span>
                        )}
                      </div>

                      {/* Add to Cart button */}
                      <div className="h-[60px] flex items-center justify-center px-4">
                        <button
                          className="button-main py-1.5 px-5 text-sm"
                          onClick={() => handleAddToCart(item)}>
                          Add To Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Compare;
