"use client";

import React, { useEffect, useState } from "react";
import Product from "../Product/Product";
import { ProductType } from "@/type/ProductType";
import { productsService } from "@/services/products";
import { motion } from "motion/react";

interface Props {
  start?: number;
  limit?: number;
}

type TabKey = "all" | "man" | "women" | "kids" | "unisex";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "man", label: "Men" },
  { key: "women", label: "Women" },
  { key: "kids", label: "Kids" },
  { key: "unisex", label: "Unisex" },
];

const WhatNewOne: React.FC<Props> = ({ start = 0, limit = 16 }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    productsService
      .list({ type: activeTab, per_page: limit })
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .catch((err) => {
        console.error("Product fetch failed:", err);
        if (mounted) setProducts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeTab, limit]);

  const visible = products.slice(start, start + limit);

  return (
    <div className="whate-new-block md:pt-20 pt-10">
      <div className="container">
        <div className="heading flex flex-col items-center text-center">
          <div className="heading3">What{String.raw`'s`} new</div>
          <div className="menu-tab flex flex-wrap items-center justify-center gap-2 p-1 bg-surface rounded-2xl mt-6 w-fit mx-auto">
            {TABS.map((tab) => (
              <div
                key={tab.key}
                className={`tab-item relative text-center text-secondary text-button-uppercase py-2 px-3 cursor-pointer duration-500 hover:text-black whitespace-nowrap ${
                  activeTab === tab.key ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.key)}>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-2xl bg-white"
                  />
                )}

                <span className="relative z-[1] text-button-uppercase">
                  {tab.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="list-product hide-product-sold grid lg:grid-cols-4 grid-cols-2 sm:gap-[30px] gap-[20px] md:mt-10 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-surface rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-secondary">
            No products found.
          </div>
        ) : (
          <div className="list-product hide-product-sold grid lg:grid-cols-4 grid-cols-2 sm:gap-[30px] gap-[20px] md:mt-10 mt-6">
            {visible.map((prd) => (
              <Product data={prd} type="grid" key={prd.id} style="style-1" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatNewOne;
