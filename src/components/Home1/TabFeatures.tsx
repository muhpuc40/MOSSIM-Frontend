"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css/bundle";
import Product from "../Product/Product";
import { ProductType } from "@/type/ProductType";
import { motion } from "motion/react";
import { productsService } from "@/services/products";

interface Props {
  start: number;
  limit: number;
}

type TabKey = "best sellers" | "new arrivals";

const TabFeatures: React.FC<Props> = ({ start, limit }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("best sellers");

  const [bestSellers, setBestSellers] = useState<ProductType[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch both lists once ──────────────────────────── */
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      productsService.bestSellers(limit),
      productsService.newArrivals(limit),
    ])
      .then(([best, arrivals]) => {
        if (!mounted) return;
        setBestSellers(best);
        setNewArrivals(arrivals);
      })
      .catch((err) => console.error("TabFeatures fetch error:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [limit]);

  /* ── Active list ────────────────────────────────────── */
  const getActiveList = (): ProductType[] => {
    if (activeTab === "best sellers") return bestSellers;
    if (activeTab === "new arrivals") return newArrivals;
    return [];
  };

  const products = getActiveList().slice(start, start + limit);

  return (
    <div className="tab-features-block md:pt-20 pt-10">
      <div className="container">
        <div className="heading flex flex-col items-center text-center">
          <div className="menu-tab flex items-center gap-2 p-1 bg-surface rounded-2xl">
            {(["best sellers", "new arrivals"] as TabKey[]).map(
              (item, index) => (
                <div
                  key={index}
                  className={`tab-item relative text-secondary heading5 py-2 px-5 cursor-pointer duration-500 hover:text-black ${activeTab === item ? "active" : ""}`}
                  onClick={() => setActiveTab(item)}>
                  {activeTab === item && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-2xl bg-white"></motion.div>
                  )}
                  <span className="relative heading5 z-[1]">{item}</span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="list-product hide-product-sold section-swiper-navigation style-outline style-border md:mt-10 mt-6">
          {loading ? (
            <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-surface rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-secondary">
              No products available
            </div>
          ) : (
            <Swiper
              spaceBetween={12}
              slidesPerView={2}
              navigation
              loop={products.length >= 4}
              modules={[Navigation, Autoplay]}
              breakpoints={{
                576: { slidesPerView: 2, spaceBetween: 12 },
                768: { slidesPerView: 3, spaceBetween: 20 },
                1200: { slidesPerView: 4, spaceBetween: 30 },
              }}>
              {products.map((prd) => (
                <SwiperSlide key={prd.id}>
                  <Product data={prd} type="grid" style="style-1" />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabFeatures;
