"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import Product from "@/components/Product/Product";
import HandlePagination from "@/components/Other/HandlePagination";
import { ProductType } from "@/type/ProductType";
import { productsService } from "@/services/products";
import Loading from "@/components/Other/Loading";
const SearchResultContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productsPerPage = 12;

  /* ── Fetch products from API based on search query ──────── */
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setCurrentPage(0);

    productsService
      .list({
        per_page: 100,
        search: query || undefined,
      })
      .then((list) => {
        if (!mounted) return;
        setProducts(list);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Failed to load products");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [query]);

  /* ── Handlers ───────────────────────────────────────────── */
  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/search-result?query=${encodeURIComponent(trimmed)}`);
    setSearchKeyword("");
  };

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  /* ── Pagination ─────────────────────────────────────────── */
  const offset = currentPage * productsPerPage;
  const currentProducts = products.slice(offset, offset + productsPerPage);
  const pageCount = Math.ceil(products.length / productsPerPage);

  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Search Result" subHeading="Search Result" />
      </div>

      <div className="shop-product breadcrumb1 lg:py-6 md:py-4 py-3">
        <div className="container">
          {/* ── Heading + Search box ──────────────────────────── */}
          <div className="heading flex flex-col items-center">
            {query ? (
              <div className="heading4 text-center">
                {loading
                  ? `Searching for "${query}"...`
                  : `Found ${products.length} ${products.length === 1 ? "result" : "results"} for "${query}"`}
              </div>
            ) : (
              <div className="heading4 text-center">Search Our Collection</div>
            )}

            <div className="input-block lg:w-1/2 sm:w-3/5 w-full md:h-[52px] h-[44px] sm:mt-8 mt-5">
              <div className="w-full h-full relative">
                <input
                  type="text"
                  placeholder="Search more products..."
                  className="caption1 w-full h-full pl-4 md:pr-[150px] pr-32 rounded-xl border border-line"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearch(searchKeyword)
                  }
                />
                <button
                  className="button-main absolute top-1 bottom-1 right-1 flex items-center justify-center"
                  onClick={() => handleSearch(searchKeyword)}>
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* ── Results ───────────────────────────────────────── */}
          <div className="list-product-block relative md:pt-10 pt-6">
            {/* Loading state */}
            {loading && <Loading />}

            {/* Error state */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-20">
                <Icon.WarningCircle size={48} className="text-red mb-4" />
                <p className="text-red">{error}</p>
                <button
                  onClick={() => router.refresh()}
                  className="button-main mt-4 bg-black text-white">
                  Try Again
                </button>
              </div>
            )}

            {/* No results */}
            {!loading && !error && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-5">
                  <Icon.MagnifyingGlass size={36} className="text-secondary2" />
                </div>
                <div className="heading5 mb-2">No Products Found</div>
                <p className="text-secondary text-center max-w-md mb-6">
                  {query
                    ? `We couldn't find any products matching "${query}". Try a different search term.`
                    : "Enter a search term above to find products."}
                </p>
                <button
                  onClick={() => router.push("/shop")}
                  className="button-main bg-black text-white">
                  Browse All Products
                </button>
              </div>
            )}

            {/* Product grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="list-product hide-product-sold grid lg:grid-cols-4 sm:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px] mt-5">
                  {currentProducts.map((item) => (
                    <Product
                      key={item.id}
                      data={item}
                      type="grid"
                      style="style-1"
                    />
                  ))}
                </div>

                {pageCount > 1 && (
                  <div className="list-pagination flex items-center justify-center md:mt-10 mt-7">
                    <HandlePagination
                      pageCount={pageCount}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

/* ── Wrap with Suspense for Next.js useSearchParams ───────── */
const SearchResult = () => {
  return (
    <Suspense
      fallback={
        <>
          <TopNavOne props="style-one bg-black" />
          <div id="header" className="relative w-full">
            <MenuOne props="bg-transparent" />
            <Breadcrumb heading="Search Result" subHeading="Search Result" />
          </div>
          <Loading />
          <Footer />
        </>
      }>
      <SearchResultContent />
    </Suspense>
  );
};

export default SearchResult;
