"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import Product from "@/components/Product/Product";
import HandlePagination from "@/components/Other/HandlePagination";
import { ProductType } from "@/type/ProductType";
import { ApiProduct, mapToProductType } from "@/services/products";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ShopColor {
  name: string;
  hex: string | null;
}
interface ShopData {
  types: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  colors: ShopColor[];
  sizes: string[];
  price_range: { min: number; max: number };
}
interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

interface Props {
  productPerPage: number;
  dataType?: string | null;
  gender?: string | null;
  category?: string | null;
  initialProducts?: ApiProduct[];
  initialMeta?: PaginationMeta | null;
  initialShopData?: ShopData | null;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const ShopBreadCrumb1: React.FC<Props> = ({
  productPerPage,
  dataType: initType,
  category: initCategory,
  initialProducts,
  initialMeta,
  initialShopData,
}) => {
  /* ── Filter state ── */
  const [type, setType] = useState<string | null>(initType ?? null);
  const [category, setCategory] = useState<string | null>(initCategory ?? null);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>(
    initialShopData
      ? {
          min: Math.floor(initialShopData.price_range.min),
          max: Math.ceil(initialShopData.price_range.max),
        }
      : { min: 0, max: 10000 },
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [layoutCol, setLayoutCol] = useState(3);

  const debouncedPrice = useDebounce(priceRange, 400);

  /* ── Data state — pre-filled from server, so NO loading on first paint ── */
  const [shopData] = useState<ShopData | null>(initialShopData ?? null);
  const [products, setProducts] = useState<ProductType[]>(
    initialProducts ? initialProducts.map(mapToProductType) : [],
  );
  const [pageMeta, setPageMeta] = useState<PaginationMeta | null>(
    initialMeta ?? null,
  );
  const [loading, setLoading] = useState(false);
  const filtersLoading = !initialShopData;

  const abortRef = useRef<AbortController | null>(null);
  const isFirstRun = useRef(true);

  /* ── Re-fetch products ONLY when a filter actually changes ──
       Skips the very first run because the server already gave us page 1.  */
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    const params = new URLSearchParams();
    params.set("per_page", String(productPerPage));
    params.set("page", String(currentPage + 1));
    if (type) params.set("type", type);
    if (category) params.set("category", category);
    if (color) params.set("color", color);
    if (size) params.set("size", size);
    if (debouncedPrice.min > 0)
      params.set("min_price", String(debouncedPrice.min));
    if (shopData && debouncedPrice.max < Math.ceil(shopData.price_range.max))
      params.set("max_price", String(debouncedPrice.max));
    if (sortOption === "priceLowToHigh") params.set("sort", "price_asc");
    if (sortOption === "priceHighToLow") params.set("sort", "price_desc");
    if (sortOption === "discountHighToLow") params.set("sort", "discount_desc");

    fetch(`${API_URL}/products?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        if (controller.signal.aborted) return;
        setProducts((json.data as ApiProduct[]).map(mapToProductType));
        if (json.meta) setPageMeta(json.meta);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("products:", err);
        setLoading(false);
      });

    return () => controller.abort();
  }, [
    type,
    category,
    color,
    size,
    debouncedPrice,
    sortOption,
    currentPage,
    productPerPage,
    shopData,
  ]);

  /* ── Handlers ── */
  const handleType = useCallback((val: string) => {
    setType((p) => (p === val ? null : val));
    setCurrentPage(0);
  }, []);
  const handleCategory = useCallback((val: string) => {
    setCategory((p) => (p === val ? null : val));
    setCurrentPage(0);
  }, []);
  const handleSize = useCallback((val: string) => {
    setSize((p) => (p === val ? null : val));
    setCurrentPage(0);
  }, []);
  const handleColor = useCallback((val: string) => {
    setColor((p) => (p === val ? null : val));
    setCurrentPage(0);
  }, []);
  const handlePriceChange = useCallback((values: number | number[]) => {
    if (Array.isArray(values))
      setPriceRange({ min: values[0], max: values[1] });
  }, []);
  const handleClearAll = useCallback(() => {
    setType(null);
    setCategory(null);
    setSize(null);
    setColor(null);
    setSortOption("");
    if (shopData)
      setPriceRange({
        min: Math.floor(shopData.price_range.min),
        max: Math.ceil(shopData.price_range.max),
      });
    setCurrentPage(0);
  }, [shopData]);

  const pageCount = pageMeta?.last_page ?? 0;
  const totalProducts = pageMeta?.total ?? 0;
  const pageLabel = category ?? type ?? "Shop";
  const activeFilters = [type, category, size, color].filter(Boolean);

  const gridClass = `list-product hide-product-sold grid ${layoutCol === 3 ? "lg:grid-cols-3 sm:grid-cols-2 grid-cols-2" : "grid-cols-1"} sm:gap-[30px] gap-[20px] mt-7`;

  return (
    <>
      {/* ── Breadcrumb header ── */}
      <div className="breadcrumb-block style-img">
        <div className="breadcrumb-main bg-linear overflow-hidden">
          <div className="container lg:pt-[134px] pt-24 pb-10 relative">
            <div className="main-content w-full h-full flex flex-col items-center justify-center relative z-[1]">
              <div className="text-content">
                <div className="heading2 text-center capitalize">
                  {pageLabel}
                </div>
                <div className="link flex items-center justify-center gap-1 caption1 mt-3">
                  <Link href="/">Homepage</Link>
                  <Icon.CaretRight size={14} className="text-secondary2" />
                  <div className="text-secondary2 capitalize">{pageLabel}</div>
                </div>
              </div>
              <div className="list-tab flex flex-wrap items-center justify-center gap-y-5 gap-8 lg:mt-[70px] mt-12">
                {["man", "women", "kids", "unisex"].map((item) => (
                  <div
                    key={item}
                    className={`tab-item text-button-uppercase cursor-pointer has-line-before line-2px ${type === item ? "active" : ""}`}
                    onClick={() => handleType(item)}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shop-product breadcrumb1 lg:py-20 md:py-14 py-10">
        <div className="container">
          <div className="flex max-md:flex-wrap max-md:flex-col-reverse gap-y-8">
            {/* ── Sidebar ── */}
            <div className="sidebar lg:w-1/4 md:w-1/3 w-full md:pr-12">
              {/* Category */}
              <div className="filter-type pb-8 border-b border-line">
                <div className="heading6">Category</div>
                <div className="list-type mt-4">
                  {filtersLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-5 bg-surface rounded animate-pulse mb-3"
                        />
                      ))
                    : shopData?.categories.map((cat) => (
                        <div
                          key={cat.name}
                          className={`item flex items-center justify-between cursor-pointer ${category === cat.name ? "active" : ""}`}
                          onClick={() => handleCategory(cat.name)}>
                          <div className="text-secondary has-line-before hover:text-black capitalize py-1">
                            {cat.name}
                          </div>
                          <div className="text-secondary2 caption1">
                            ({cat.count})
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              {/* Size */}
              <div className="filter-size pb-8 border-b border-line mt-8">
                <div className="heading6">Size</div>
                <div className="list-size flex items-center flex-wrap gap-3 gap-y-3 mt-4">
                  {filtersLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-12 h-10 bg-surface rounded-full animate-pulse"
                        />
                      ))
                    : shopData?.sizes.map((item) => (
                        <div
                          key={item}
                          className={`size-item text-button px-4 py-2 flex items-center justify-center rounded-full border border-line cursor-pointer ${size === item ? "active" : ""}`}
                          onClick={() => handleSize(item)}>
                          {item}
                        </div>
                      ))}
                </div>
              </div>

              {/* Price */}
              <div className="filter-price pb-8 border-b border-line mt-8">
                <div className="heading6">Price Range</div>
                {shopData && (
                  <Slider
                    range
                    min={Math.floor(shopData.price_range.min)}
                    max={Math.ceil(shopData.price_range.max)}
                    value={[priceRange.min, priceRange.max]}
                    onChange={handlePriceChange}
                    className="mt-5"
                  />
                )}
                <div className="price-block flex items-center justify-between flex-wrap mt-4">
                  <div className="min flex items-center gap-1">
                    <div className="caption1">Min:</div>
                    <div className="price-min caption1 font-semibold">
                      ৳{priceRange.min.toLocaleString()}
                    </div>
                  </div>
                  <div className="max flex items-center gap-1">
                    <div className="caption1">Max:</div>
                    <div className="price-max caption1 font-semibold">
                      ৳{priceRange.max.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="filter-color pb-8 border-b border-line mt-8">
                <div className="heading6">Colors</div>
                <div className="list-color flex items-center flex-wrap gap-3 gap-y-4 mt-4">
                  {filtersLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-surface animate-pulse"
                        />
                      ))
                    : shopData?.colors.map((c, idx) =>
                        c.hex ? (
                          <div
                            key={`${c.name}-${idx}`}
                            title={c.name}
                            className={`color-item w-8 h-8 rounded-full cursor-pointer border-2 duration-300 ${color === c.name ? "border-black scale-110" : "border-transparent hover:border-black"}`}
                            style={{ backgroundColor: c.hex }}
                            onClick={() => handleColor(c.name)}>
                            <div className="tag-action bg-black text-white caption2 capitalize px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                              {c.name}
                            </div>
                          </div>
                        ) : (
                          <div
                            key={`${c.name}-${idx}`}
                            className={`color-item px-3 py-[5px] flex items-center justify-center rounded-full border cursor-pointer caption2 duration-300 ${color === c.name ? "bg-black text-white border-black" : "border-line hover:border-black"}`}
                            onClick={() => handleColor(c.name)}>
                            {c.name}
                          </div>
                        ),
                      )}
                </div>
              </div>

              {/* Clear */}
              {activeFilters.length > 0 && (
                <div
                  className="clear-btn flex items-center justify-center px-4 py-2 gap-1 mt-6 rounded-full border border-red cursor-pointer"
                  onClick={handleClearAll}>
                  <Icon.X color="rgb(219, 68, 68)" size={14} />
                  <span className="text-button-uppercase text-red">
                    Clear All
                  </span>
                </div>
              )}
            </div>

            {/* ── Products ── */}
            <div className="list-product-block lg:w-3/4 md:w-2/3 w-full md:pl-3">
              {/* Toolbar */}
              <div className="filter-heading flex items-center justify-between gap-5 flex-wrap">
                <div className="left flex has-line items-center flex-wrap gap-5">
                  <div className="choose-layout flex items-center gap-2">
                    <div
                      className={`item three-col w-8 h-8 border border-line rounded flex items-center justify-center cursor-pointer ${layoutCol === 3 ? "active" : ""}`}
                      onClick={() => setLayoutCol(3)}>
                      <div className="flex items-center gap-0.5">
                        <span className="w-[3px] h-4 bg-secondary2 rounded-sm" />
                        <span className="w-[3px] h-4 bg-secondary2 rounded-sm" />
                        <span className="w-[3px] h-4 bg-secondary2 rounded-sm" />
                      </div>
                    </div>
                    <div
                      className={`item row w-8 h-8 border border-line rounded flex items-center justify-center cursor-pointer ${layoutCol === 1 ? "active" : ""}`}
                      onClick={() => setLayoutCol(1)}>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="w-4 h-[3px] bg-secondary2 rounded-sm" />
                        <span className="w-4 h-[3px] bg-secondary2 rounded-sm" />
                        <span className="w-4 h-[3px] bg-secondary2 rounded-sm" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="right flex items-center gap-3">
                  <div className="total-product caption1">
                    {loading ? (
                      <span className="text-secondary">Loading...</span>
                    ) : (
                      <>
                        {totalProducts}
                        <span className="pl-1">Products</span>
                      </>
                    )}
                  </div>
                  <div className="select-block relative">
                    <select
                      className="caption1 py-2 pl-3 md:pr-20 pr-10 rounded-lg border border-line"
                      value={sortOption}
                      onChange={(e) => {
                        setSortOption(e.target.value);
                        setCurrentPage(0);
                      }}>
                      <option value="">Default</option>
                      <option value="discountHighToLow">Best Discount</option>
                      <option value="priceHighToLow">Price High To Low</option>
                      <option value="priceLowToHigh">Price Low To High</option>
                    </select>
                    <Icon.CaretDown
                      size={12}
                      className="absolute top-1/2 -translate-y-1/2 md:right-4 right-2"
                    />
                  </div>
                </div>
              </div>

              {/* Active filter chips */}
              {activeFilters.length > 0 && (
                <div className="list-filtered flex items-center gap-3 mt-4 flex-wrap">
                  <div className="w-px h-4 bg-line" />
                  {type && (
                    <div
                      className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize cursor-pointer"
                      onClick={() => {
                        setType(null);
                        setCurrentPage(0);
                      }}>
                      <Icon.X size={12} />
                      <span className="caption1">{type}</span>
                    </div>
                  )}
                  {category && (
                    <div
                      className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize cursor-pointer"
                      onClick={() => {
                        setCategory(null);
                        setCurrentPage(0);
                      }}>
                      <Icon.X size={12} />
                      <span className="caption1">{category}</span>
                    </div>
                  )}
                  {size && (
                    <div
                      className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize cursor-pointer"
                      onClick={() => {
                        setSize(null);
                        setCurrentPage(0);
                      }}>
                      <Icon.X size={12} />
                      <span className="caption1">Size: {size}</span>
                    </div>
                  )}
                  {color && (
                    <div
                      className="item flex items-center px-2 py-1 gap-1 bg-linear rounded-full capitalize cursor-pointer"
                      onClick={() => {
                        setColor(null);
                        setCurrentPage(0);
                      }}>
                      <Icon.X size={12} />
                      <span className="caption1">{color}</span>
                    </div>
                  )}
                  <div
                    className="clear-btn flex items-center px-2 py-1 gap-1 rounded-full border border-red cursor-pointer"
                    onClick={handleClearAll}>
                    <Icon.X color="rgb(219, 68, 68)" size={12} />
                    <span className="text-button-uppercase text-red caption2">
                      Clear All
                    </span>
                  </div>
                </div>
              )}

              {/* Grid */}
              {loading ? (
                <div className={gridClass}>
                  {Array.from({ length: productPerPage }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] bg-surface rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className={gridClass}>
                  {products.map((item) => (
                    <Product
                      key={item.id}
                      data={item}
                      type={layoutCol === 3 ? "grid" : "list"}
                      style="style-1"
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="list-pagination flex items-center md:mt-10 mt-7">
                  <HandlePagination
                    pageCount={pageCount}
                    onPageChange={(page: number) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopBreadCrumb1;
