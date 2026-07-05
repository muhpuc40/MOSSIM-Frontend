"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProductType } from "@/type/ProductType";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { useCart } from "@/context/CartContext";
import { useModalCartContext } from "@/context/ModalCartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useModalWishlistContext } from "@/context/ModalWishlistContext";
import { useCompare } from "@/context/CompareContext";
import { useModalCompareContext } from "@/context/ModalCompareContext";
import { useModalQuickviewContext } from "@/context/ModalQuickviewContext";
import { useRouter } from "next/navigation";

interface ProductProps {
  data: ProductType;
  type: string;
  style: string;
}

const Product: React.FC<ProductProps> = ({ data, type, style }) => {
  const [activeColor, setActiveColor] = useState<string>("");
  const [activeSize, setActiveSize] = useState<string>("");
  const [openQuickShop, setOpenQuickShop] = useState<boolean>(false);
  const { quickAdd } = useCart();
  const { openModalCart } = useModalCartContext();
  const { addToWishlist, removeFromWishlist, wishlistState } = useWishlist();
  const { openModalWishlist } = useModalWishlistContext();
  const { addToCompare, removeFromCompare, compareState } = useCompare();
  const { openModalCompare } = useModalCompareContext();
  const { openQuickview } = useModalQuickviewContext();
  const router = useRouter();

  // Discount straight from backend (slug=discount_type, rate=discount_value)
  const discountType = data.slug || "";
  const discountValue = data.rate || 0;
  const hasDiscount = !!discountType && discountValue > 0;
  const discountLabel =
    discountType === "percent" ? `-${discountValue}%` : `-৳${discountValue}`;

  const handleActiveColor = (item: string) => setActiveColor(item);
  const handleActiveSize = (item: string) => setActiveSize(item);

const handleAddToCart = () => {
    quickAdd(data)
    openModalCart()
}
  const handleAddToWishlist = () => {
    if (wishlistState.wishlistArray.some((item) => item.id === data.id)) {
      removeFromWishlist(data.id);
    } else {
      addToWishlist(data);
    }
    openModalWishlist();
  };

  const handleAddToCompare = () => {
    if (compareState.compareArray.length < 3) {
      if (compareState.compareArray.some((item) => item.id === data.id)) {
        removeFromCompare(data.id);
      } else {
        addToCompare(data);
      }
    } else {
      alert("Compare up to 3 products");
    }
    openModalCompare();
  };

  const handleQuickviewOpen = () => openQuickview(data);

  const handleDetailProduct = (productId: string) => {
    router.push(`/product/details?id=${productId}`);
  };

  return (
    <>
      {type === "grid" ? (
        <div className={`product-item grid-type ${style}`}>
          <div
            onClick={() => handleDetailProduct(data.id)}
            className="product-main cursor-pointer block">
            <div className="product-thumb bg-white relative overflow-hidden rounded-2xl">
              {/* Right action icons */}
              {(style === "style-1" ||
                style === "style-3" ||
                style === "style-4") && (
                <div className="list-action-right absolute top-3 right-3 max-lg:hidden">
                  <div
                    className={`add-wishlist-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative ${wishlistState.wishlistArray.some((item) => item.id === data.id) ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist();
                    }}>
                    <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                      Add To Wishlist
                    </div>
                    {wishlistState.wishlistArray.some(
                      (item) => item.id === data.id,
                    ) ? (
                      <Icon.Heart
                        size={18}
                        weight="fill"
                        className="text-white"
                      />
                    ) : (
                      <Icon.Heart size={18} />
                    )}
                  </div>
                  <div
                    className={`compare-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative mt-2 ${compareState.compareArray.some((item) => item.id === data.id) ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCompare();
                    }}>
                    <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                      Compare Product
                    </div>
                    <Icon.Repeat size={18} className="compare-icon" />
                    <Icon.CheckCircle size={20} className="checked-icon" />
                  </div>
                </div>
              )}

              {/* Image */}
              <div className="product-img w-full h-full aspect-[3/4]">
                {data.thumbImage.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    width={500}
                    height={500}
                    priority={true}
                    alt={data.name}
                    className="w-full h-full object-cover duration-700"
                  />
                ))}
              </div>

              {/* Quick View + Add To Cart */}
              {(style === "style-1" || style === "style-3") && (
                <div
                  className={`list-action ${style === "style-1" ? "grid grid-cols-2 gap-3" : ""} px-5 absolute w-full bottom-5 max-lg:hidden`}>
                  <div
                    className="quick-view-btn w-full text-button-uppercase py-2 text-center rounded-full duration-300 bg-white hover:bg-black hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickviewOpen();
                    }}>
                    Quick View
                  </div>
                  <div
                    className="add-cart-btn w-full text-button-uppercase py-2 text-center rounded-full duration-500 bg-white hover:bg-black hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart();
                    }}>
                    Add To Cart
                  </div>
                </div>
              )}

              {/* Mobile icons */}
              <div className="list-action-icon flex items-center justify-center gap-2 absolute w-full bottom-3 z-[1] lg:hidden">
                <div
                  className="quick-view-btn w-9 h-9 flex items-center justify-center rounded-lg duration-300 bg-white hover:bg-black hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickviewOpen();
                  }}>
                  <Icon.Eye className="text-lg" />
                </div>
                <div
                  className="add-cart-btn w-9 h-9 flex items-center justify-center rounded-lg duration-300 bg-white hover:bg-black hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}>
                  <Icon.ShoppingBagOpen className="text-lg" />
                </div>
              </div>
            </div>

            <div className="product-infor mt-4 lg:mb-7">
              <div className="product-name text-title duration-300">
                {data.name}
              </div>

              {/* Colors — hex swatches */}
              {data.variation.length > 0 && (
                <div className="list-color py-2 max-md:hidden flex items-center gap-2 flex-wrap duration-500">
                  {data.variation.map((item, index) => (
                    <div
                      key={index}
                      className={`color-item w-6 h-6 rounded-full duration-300 relative ${activeColor === item.color ? "active" : ""}`}
                      style={{ backgroundColor: `${item.colorCode}` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActiveColor(item.color);
                      }}>
                      <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                        {item.color}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="product-price-block flex items-center gap-2 flex-wrap mt-1 duration-300 relative z-[1]">
                <div className="product-price text-title">৳{data.price}</div>
                {hasDiscount && (
                  <>
                    <div className="product-origin-price caption1 text-secondary2">
                      <del>৳{data.originPrice}</del>
                    </div>
                    <div className="product-sale caption1 font-medium bg-green px-3 py-0.5 inline-block rounded-full">
                      {discountLabel}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : type === "list" ? (
        <div className="product-item list-type">
          <div className="product-main cursor-pointer flex lg:items-center sm:justify-between gap-7 max-lg:gap-5">
            <div
              onClick={() => handleDetailProduct(data.id)}
              className="product-thumb bg-white relative overflow-hidden rounded-2xl block max-sm:w-1/2">
              <div className="product-img w-full aspect-[3/4] rounded-2xl overflow-hidden">
                {data.thumbImage.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    width={500}
                    height={500}
                    priority
                    alt={data.name}
                    className="w-full h-full object-cover duration-700"
                  />
                ))}
              </div>
            </div>
            <div className="flex sm:items-center gap-7 max-lg:gap-4 max-lg:flex-wrap max-lg:w-full max-sm:flex-col max-sm:w-1/2">
              <div className="product-infor max-sm:w-full">
                <div
                  onClick={() => handleDetailProduct(data.id)}
                  className="product-name heading6 inline-block duration-300">
                  {data.name}
                </div>
                <div className="product-price-block flex items-center gap-2 flex-wrap mt-2 duration-300 relative z-[1]">
                  <div className="product-price text-title">৳{data.price}</div>
                  {hasDiscount && (
                    <>
                      <div className="product-origin-price caption1 text-secondary2">
                        <del>৳{data.originPrice}</del>
                      </div>
                      <div className="product-sale caption1 font-medium bg-green px-3 py-0.5 inline-block rounded-full">
                        {discountLabel}
                      </div>
                    </>
                  )}
                </div>
                {data.variation.length > 0 && (
                  <div className="list-color max-md:hidden py-2 mt-5 mb-1 flex items-center gap-3 flex-wrap duration-300">
                    {data.variation.map((item, index) => (
                      <div
                        key={index}
                        className="color-item w-8 h-8 rounded-full duration-300 relative"
                        style={{ backgroundColor: `${item.colorCode}` }}>
                        <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm">
                          {item.color}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-secondary desc mt-5 max-sm:hidden">
                  {data.description}
                </div>
              </div>
              <div className="action w-fit flex flex-col items-center justify-center">
                <div
                  className="quick-shop-btn button-main whitespace-nowrap py-2 px-9 max-lg:px-5 rounded-full bg-white text-black border border-black hover:bg-black hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickviewOpen();
                  }}>
                  Quick View
                </div>
                <div className="list-action-right flex items-center justify-center gap-3 mt-4">
                  <div
                    className={`add-wishlist-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative ${wishlistState.wishlistArray.some((item) => item.id === data.id) ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist();
                    }}>
                    <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                      Add To Wishlist
                    </div>
                    {wishlistState.wishlistArray.some(
                      (item) => item.id === data.id,
                    ) ? (
                      <Icon.Heart
                        size={18}
                        weight="fill"
                        className="text-white"
                      />
                    ) : (
                      <Icon.Heart size={18} />
                    )}
                  </div>
                  <div
                    className={`compare-btn w-[32px] h-[32px] flex items-center justify-center rounded-full bg-white duration-300 relative ${compareState.compareArray.some((item) => item.id === data.id) ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCompare();
                    }}>
                    <div className="tag-action bg-black text-white caption2 px-1.5 py-0.5 rounded-sm">
                      Compare Product
                    </div>
                    <Icon.ArrowsCounterClockwise
                      size={18}
                      className="compare-icon"
                    />
                    <Icon.CheckCircle size={20} className="checked-icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : type === "marketplace" ? (
        <div
          className="product-item style-marketplace p-4 border border-line rounded-2xl"
          onClick={() => handleDetailProduct(data.id)}>
          <div className="bg-img relative w-full">
            <Image
              className="w-full aspect-square"
              width={5000}
              height={5000}
              src={data.thumbImage[0]}
              alt={data.name}
            />
            <div className="list-action flex flex-col gap-1 absolute top-0 right-0">
              <span
                className="quick-view-btn w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-sm duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickviewOpen();
                }}>
                <Icon.Eye />
              </span>
              <span
                className="add-cart-btn w-8 h-8 bg-white flex items-center justify-center rounded-full box-shadow-sm duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}>
                <Icon.ShoppingBagOpen />
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Product;
