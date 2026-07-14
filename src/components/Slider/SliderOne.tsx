"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import "swiper/css/effect-fade";

import { bannersService } from "@/services/banners";
import type { Banner } from "@/type/Banner";
import Loading from "@/components/Other/Loading";

const SliderOne = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    bannersService
      .list()
      .then((data) => {
        if (mounted) setBanners(data);
      })
      .catch((err) => {
        console.error("Banner fetch failed:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="slider-block style-one bg-linear xl:h-[860px] lg:h-[800px] md:h-[580px] sm:h-[500px] h-[350px] max-[420px]:h-[320px] w-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <>
      <div className="slider-block style-one bg-linear xl:h-[860px] lg:h-[800px] md:h-[580px] sm:h-[500px] h-[350px] max-[420px]:h-[320px] w-full">
        <div className="slider-main h-full w-full">
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            loop={banners.length > 1}
            pagination={{ clickable: true }}
            modules={[Pagination, Autoplay]}
            className="h-full relative"
            autoplay={{ delay: 4000 }}>
            {banners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="slider-item h-full w-full relative">
                  <div className="container w-full h-full flex items-center relative">
                    <div className="text-content basis-1/2">
                      <div className="text-sub-display">{banner.subtitle}</div>
                      <div className="text-display md:mt-5 mt-2">
                        {banner.title}
                      </div>
                      <Link
                        href={banner.cta_link || "/shop/breadcrumb-img"}
                        className="button-main md:mt-8 mt-3">
                        {banner.cta_text || "Shop Now"}
                      </Link>
                    </div>
                    <div className="sub-img absolute sm:w-1/2 w-3/5 2xl:-right-[60px] -right-[16px] bottom-0">
                      <Image
                        src={banner.image}
                        width={670}
                        height={936}
                        alt={banner.alt_text || banner.title}
                        priority
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default SliderOne;
