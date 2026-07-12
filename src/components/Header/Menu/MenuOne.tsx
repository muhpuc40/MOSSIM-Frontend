"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import { usePathname, useRouter } from "next/navigation";
import useLoginPopup from "@/store/useLoginPopup";
import useMenuMobile from "@/store/useMenuMobile";
import { useAuth } from "@/context/AuthContext";
import { useModalCartContext } from "@/context/ModalCartContext";
import { useModalWishlistContext } from "@/context/ModalWishlistContext";
import { useCart } from "@/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

let _categories: string[] = [];
let _fetched = false;

const TYPES = [
  { label: "Man", value: "man" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
  { label: "Unisex", value: "unisex" },
];

interface Props {
  props: string;
}

const MenuOne: React.FC<Props> = ({ props }) => {
  const router = useRouter();
  const pathname = usePathname();

  /* ── ALL hooks must be here, inside the component ── */
  const { user, isLoggedIn, logout } = useAuth(); // ✅ moved inside
  const { openLoginPopup, handleLoginPopup } = useLoginPopup();
  const { openMenuMobile, handleMenuMobile } = useMenuMobile();
  const { openModalCart } = useModalCartContext();
  const { cartState } = useCart();
  const { openModalWishlist } = useModalWishlistContext();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [fixedHeader, setFixedHeader] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [categories, setCategories] = useState<string[]>(_categories);
  const [categoriesLoading, setCategoriesLoading] = useState(!_fetched);

  /* ── Sticky on scroll-up ─────────────────── */
  useEffect(() => {
    const handleScroll = () => {
      const pos = window.scrollY;
      setFixedHeader(pos > 0 && pos < lastScrollPosition);
      setLastScrollPosition(pos);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollPosition]);

  /* ── Fetch categories once ───────────────── */
  useEffect(() => {
    if (_fetched) {
      setCategories(_categories);
      setCategoriesLoading(false);
      return;
    }

    setCategoriesLoading(true);

    fetch(`${API_URL}/products/shop-data`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load categories: ${response.status}`);
        }

        return response.json();
      })
      .then((json) => {
        if (json.success && Array.isArray(json.data?.categories)) {
          _categories = json.data.categories.map(
            (category: { name: string }) => category.name,
          );

          _fetched = true;
          setCategories(_categories);
        }
      })
      .catch((error) => {
        console.error("menu categories:", error);
      })
      .finally(() => {
        setCategoriesLoading(false);
      });
  }, []);

  /* ── Handlers ────────────────────────────── */
  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    router.push(`/search-result?query=${encodeURIComponent(value)}`);
    setSearchKeyword("");
  };
  const handleTypeClick = (type: string) => router.push(`/shop?type=${type}`);
  const handleCategoryClick = (cat: string) =>
    router.push(`/shop?category=${encodeURIComponent(cat)}`);

  return (
    <>
      {/* ══════════ DESKTOP HEADER ══════════ */}
      <div
        className={`header-menu style-one ${fixedHeader ? "fixed" : "absolute"} top-0 left-0 right-0 w-full md:h-[74px] h-[56px] ${props}`}>
        <div className="container mx-auto h-full">
          <div className="header-main flex justify-between h-full">
            {/* Hamburger */}
            <div
              className="menu-mobile-icon lg:hidden flex items-center"
              onClick={handleMenuMobile}>
              <i className="icon-category text-2xl" />
            </div>

            {/* Left — Logo + Nav */}
            <div className="left flex items-center gap-16">
              <Link
                href="/"
                className="flex items-center gap-2 max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2">
                <Image
                  src="/images/mossim.png"
                  alt="MOSSIM"
                  width={39}
                  height={39}
                  className="h-12 w-auto"
                />
                <div className="heading4">MOSSIM</div>
              </Link>

              <div className="menu-main h-full max-lg:hidden">
                <ul className="flex items-center gap-8 h-full">
                  {/* ── SHOP ──────────────────── */}
                  <li className="h-full" style={{ position: "relative" }}>
                    <Link
                      href="/shop"
                      className={`text-button-uppercase duration-300 h-full flex items-center justify-center ${pathname.includes("/shop/") ? "active" : ""}`}>
                      Shop
                    </Link>
                    <div
                      className="mega-menu"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "560px",
                        backgroundColor: "white",
                        borderRadius: "0 0 16px 16px",
                        padding: "24px",
                        display: "flex",
                        gap: "24px",
                        transformOrigin: "top left",
                      }}>
                      {/* Types */}
                      <div
                        style={{
                          paddingRight: "24px",
                          borderRight: "1px solid #f0f0f0",
                          minWidth: "130px",
                          flexShrink: 0,
                        }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "15px",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: "12px",
                            color: "#1a1a1a",
                          }}>
                          Type
                        </div>
                        <ul>
                          {TYPES.map((t) => (
                            <li key={t.value}>
                              <div
                                onClick={() => handleTypeClick(t.value)}
                                className="link text-secondary duration-300 cursor-pointer hover:text-black capitalize"
                                style={{
                                  padding: "6px 0",
                                  fontSize: "15px",
                                  display: "block",
                                }}>
                                {t.label}
                              </div>
                            </li>
                          ))}
                          <li style={{ paddingTop: "10px" }}>
                            <Link
                              href="/shop"
                              className="view-all-btn link text-secondary"
                              style={{ fontSize: "15px" }}>
                              View All
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Categories */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "15px",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: "12px",
                            color: "#1a1a1a",
                          }}>
                          Category
                        </div>
                        {categories.length === 0 ? (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              gap: "8px",
                            }}>
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  height: "16px",
                                  background: "#f5f5f5",
                                  borderRadius: "4px",
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <ul
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              gap: "0 8px",
                            }}>
                            {categories.map((cat) => (
                              <li key={cat}>
                                <div
                                  onClick={() => handleCategoryClick(cat)}
                                  className="link text-secondary duration-300 cursor-pointer hover:text-black"
                                  style={{
                                    padding: "6px 0",
                                    fontSize: "15px",
                                    display: "block",
                                  }}>
                                  {cat}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </li>

                  {/* ── NEW ARRIVALS ────────── */}
                </ul>
              </div>
            </div>

            {/* Right — Search + Icons */}
            <div className="right flex gap-10">
              <div className="search-main max-lg:!hidden items-center relative mt-4 w-[280px] h-[40px]">
                <input
                  type="text"
                  placeholder="Search..."
                  className="caption1 w-full h-full pl-4 pr-[80px] rounded-xl border border-line"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearch(searchKeyword)
                  }
                />
                <button
                  className="button-main absolute top-1 bottom-1 right-1 px-3 flex items-center justify-center"
                  onClick={() => handleSearch(searchKeyword)}>
                  search
                </button>
              </div>

              <div className="list-action flex items-center gap-4">
                {/* ── User icon ── */}
                <div className="user-icon flex items-center justify-center cursor-pointer">
                  {isLoggedIn ? (
                    <div className="relative">
                      <div
                        onClick={handleLoginPopup}
                        className="flex items-center gap-2">
                        {user?.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            width={32}
                            height={32}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <Icon.User size={24} color="black" />
                        )}
                      </div>
                      <div
                        className={`login-popup absolute top-[74px] w-[320px] p-7 rounded-xl bg-white box-shadow-sm ${openLoginPopup ? "open" : ""}`}>
                        <div className="text-title font-semibold text-center mb-1">
                          {user?.name}
                        </div>
                        <div className="caption1 text-secondary text-center mb-4">
                          {user?.email}
                        </div>
                        <Link
                          href="/my-account"
                          className="button-main w-full text-center block">
                          Dashboard
                        </Link>
                        <div className="bottom mt-4 pt-4 border-t border-line" />
                        <div
                          className="flex items-center justify-center gap-2 cursor-pointer hover:text-red duration-200"
                          onClick={async () => {
                            await logout();
                            router.push("/");
                          }}>
                          <Icon.SignOut size={16} />
                          <span className="body1">Logout</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Icon.User
                        size={24}
                        color="black"
                        onClick={handleLoginPopup}
                      />
                      <div
                        className={`login-popup absolute top-[54px] w-[320px] p-7 rounded-xl bg-white box-shadow-sm ${openLoginPopup ? "open" : ""}`}>
                        <Link
                          href="/login"
                          className="button-main w-full text-center block">
                          Login
                        </Link>
                        <div className="text-secondary text-center mt-3 pb-4">
                          Dont have an account?
                          <Link
                            href="/register"
                            className="text-black pl-1 hover:underline">
                            Register
                          </Link>
                        </div>
                        <div className="bottom mt-4 pt-4 border-t border-line" />
                        <Link
                          href="https://wa.me/8801322447700?text=I%20need%20help"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="body1 hover:underline">
                          Support
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="max-md:hidden wishlist-icon flex items-center cursor-pointer"
                  onClick={openModalWishlist}>
                  <Icon.Heart size={24} color="black" />
                </div>
                <div
                  className="cart-icon max-sm:hidden flex items-center relative cursor-pointer"
                  onClick={openModalCart}>
                  <Icon.Handbag size={24} color="black" />
                  <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-black w-4 h-4 flex items-center justify-center rounded-full">
                    {cartState.cartArray.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ MOBILE MENU ══════════ */}
      <div
        id="menu-mobile"
        className={`${openMenuMobile ? "open" : ""}`}
        style={{ maxWidth: "min(380px, 80vw)" }}>
        <div className="menu-container bg-white h-full">
          <div className="container h-full">
            <div className="menu-main h-full overflow-hidden">
              <div
                className="heading relative flex items-center justify-center border-b border-line"
                style={{ height: "56px" }}>
                <div
                  className="close-menu-mobile-btn absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface flex items-center justify-center cursor-pointer"
                  onClick={handleMenuMobile}>
                  <Icon.X size={14} />
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={handleMenuMobile}>
                  <Image
                    src="/images/mossim.png"
                    alt="MOSSIM"
                    width={32}
                    height={32}
                    className="h-8 w-auto"
                  />
                  <span className="text-xl font-semibold">MOSSIM</span>
                </Link>
              </div>

              <div className="form-search relative mt-2">
                <Icon.MagnifyingGlass
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-12 rounded-lg border border-line text-sm w-full pl-10 pr-4"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearch(searchKeyword)
                  }
                />
              </div>
              <div
                className="list-nav mobile-shop-direct mt-6 overflow-y-auto pb-24"
                style={{ maxHeight: "calc(100vh - 140px)" }}>
                {/* Shop heading */}
                <div className="flex items-center justify-between mb-5">
                  <div className="text-xl font-semibold">Shop</div>

                  <Link
                    href="/shop"
                    onClick={handleMenuMobile}
                    className="view-all-btn link text-secondary"
                    style={{ fontSize: "14px" }}>
                    View All
                  </Link>
                </div>

                {/* Types */}
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "8px",
                    color: "#1a1a1a",
                  }}>
                  Type
                </div>

                <ul className="grid grid-cols-2 gap-y-1 mb-6">
                  {TYPES.map((type) => (
                    <li key={type.value}>
                      <div
                        onClick={() => {
                          handleTypeClick(type.value);
                          handleMenuMobile();
                        }}
                        className="link text-secondary duration-300 cursor-pointer capitalize hover:text-black"
                        style={{
                          padding: "7px 0",
                          fontSize: "15px",
                        }}>
                        {type.label}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Categories */}
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "8px",
                    color: "#1a1a1a",
                  }}>
                  Category
                </div>

                {categoriesLoading ? (
                  <div
                    className="text-secondary"
                    style={{
                      padding: "7px 0",
                      fontSize: "14px",
                    }}>
                    Loading categories...
                  </div>
                ) : categories.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-y-0">
                    {categories.map((category) => (
                      <li key={category}>
                        <div
                          onClick={() => {
                            handleCategoryClick(category);
                            handleMenuMobile();
                          }}
                          className="link text-secondary duration-300 cursor-pointer hover:text-black"
                          style={{
                            padding: "7px 0",
                            fontSize: "15px",
                          }}>
                          {category}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div
                    className="text-secondary"
                    style={{
                      padding: "7px 0",
                      fontSize: "14px",
                    }}>
                    No categories available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ BOTTOM MOBILE BAR ══════════ */}
      <div className="menu_bar fixed bg-white bottom-0 left-0 w-full h-[70px] sm:hidden z-[101]">
        <div className="menu_bar-inner grid grid-cols-4 items-center h-full">
          <Link
            href="/"
            className="menu_bar-link flex flex-col items-center gap-1">
            <Icon.House weight="bold" className="text-2xl" />
            <span className="menu_bar-title caption2 font-semibold">Home</span>
          </Link>
          <Link
            href="/shop/breadcrumb1"
            className="menu_bar-link flex flex-col items-center gap-1">
            <Icon.List weight="bold" className="text-2xl" />
            <span className="menu_bar-title caption2 font-semibold">Shop</span>
          </Link>
          <Link
            href="/search-result"
            className="menu_bar-link flex flex-col items-center gap-1">
            <Icon.MagnifyingGlass weight="bold" className="text-2xl" />
            <span className="menu_bar-title caption2 font-semibold">
              Search
            </span>
          </Link>
          <Link
            href="/cart"
            className="menu_bar-link flex flex-col items-center gap-1">
            <div className="icon relative">
              <Icon.Handbag weight="bold" className="text-2xl" />
              <span className="quantity cart-quantity absolute -right-1.5 -top-1.5 text-xs text-white bg-black w-4 h-4 flex items-center justify-center rounded-full">
                {cartState.cartArray.length}
              </span>
            </div>
            <span className="menu_bar-title caption2 font-semibold">Cart</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default MenuOne;
