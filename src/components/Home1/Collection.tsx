"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css/bundle";
import { useRouter } from "next/navigation";
import { categoryBannersService } from "@/services/categoryBanners";
import type { CategoryBanner } from "@/type/CategoryBanner";

const Collection = () => {
  const router = useRouter();
  const [banners, setBanners] = useState<CategoryBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    categoryBannersService
      .list()
      .then((data) => {
        if (mounted) setBanners(data);
      })
      .catch((err) => {
        console.error("Error fetching category banners:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="collection-block md:pt-20 pt-10">
        <div className="container">
          <div className="heading3 text-center">Explore Collections</div>
          <div className="list-collection md:mt-10 mt-6 grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-surface rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't show anything if no banners
  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="collection-block md:pt-20 pt-10">
      <div className="container">
        <div className="heading3 text-center">Explore Collections</div>
      </div>
      <div className="list-collection section-swiper-navigation md:mt-10 mt-6 sm:px-5 px-4">
        <Swiper
          spaceBetween={12}
          slidesPerView={2}
          navigation={banners.length > 2}
          loop={banners.length > 2}
          modules={[Navigation, Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            576: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1200: {
              slidesPerView: Math.min(4, banners.length),
              spaceBetween: 20,
            },
          }}
          className="h-full">
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div
                className="collection-item block relative rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => handleCategoryClick(banner.category_name)}>
                <div className="bg-img">
                  <Image
                    src={banner.image}
                    width={1000}
                    height={600}
                    alt={banner.category_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="collection-name heading5 text-center sm:bottom-8 bottom-4 lg:w-[200px] md:w-[160px] w-[100px] md:py-3 py-1.5 bg-white text-black rounded-xl duration-500 hover:bg-gold-500 hover:text-white absolute left-1/2 -translate-x-1/2">
                  {banner.category_name}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Collection;
