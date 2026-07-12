"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { bottomBannersService } from "@/services/bottomBanners";
import type { BottomBanner } from "@/type/BottomBanner";

const Banner = () => {
  const [banners, setBanners] = useState<BottomBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    bottomBannersService
      .list()
      .then((data) => {
        if (mounted) setBanners(data);
      })
      .catch((err) => {
        console.error("Error fetching bottom banners:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Get left and right banners
  const leftBanner = banners.find((b) => b.position === 1);
  const rightBanner = banners.find((b) => b.position === 2);

  // Loading skeleton
  if (loading) {
    return (
      <div className="banner-block style-one grid sm:grid-cols-2 gap-5 md:pt-20 pt-10">
        <div className="banner-item relative block overflow-hidden rounded-xl bg-gray-200 dark:bg-zinc-800 animate-pulse h-[300px]"></div>
        <div className="banner-item relative block overflow-hidden rounded-xl bg-gray-200 dark:bg-zinc-800 animate-pulse h-[300px]"></div>
      </div>
    );
  }

  // Don't show anything if no banners
  if (!leftBanner && !rightBanner) {
    return null;
  }

  // Default banner data if not available
  const defaultBanner = {
    title: "Shop Now",
    subtitle: null,
    link: "/shop/breadcrumb-img",
    cta_text: "Shop Now",
    image: "/images/banner/1.png",
  };

  const left = leftBanner || {
    ...defaultBanner,
    title: "Best Sellers",
    image: "/images/banner/1.png",
  };
  const right = rightBanner || {
    ...defaultBanner,
    title: "New Arrivals",
    image: "/images/banner/2.png",
  };

  return (
    <div className="banner-block style-one grid sm:grid-cols-2 gap-5 pt-5">
      {/* Left Banner */}
      <Link
        href={left.link || "/shop/breadcrumb-img"}
        className="banner-item relative block overflow-hidden duration-500 group rounded-xl">
        <div className="banner-img overflow-hidden rounded-xl">
          <Image
            src={left.image}
            width={2000}
            height={1300}
            alt={left.title}
            priority={true}
            className="duration-1000 group-hover:scale-110 transition-transform"
          />
        </div>
        <div className="banner-content absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black/20 rounded-xl">
          <div className="heading2 text-white text-center px-4">
            {left.title}
          </div>
          {left.subtitle && (
            <div className="body1 text-white text-center mt-2 px-4">
              {left.subtitle}
            </div>
          )}
          <div className="text-button text-white relative inline-block pb-1 border-b-2 border-white duration-500 mt-2 group-hover:pb-2">
            {left.cta_text}
          </div>
        </div>
      </Link>

      {/* Right Banner */}
      <Link
        href={right.link || "/shop/breadcrumb-img"}
        className="banner-item relative block overflow-hidden duration-500 group rounded-xl">
        <div className="banner-img overflow-hidden rounded-xl">
          <Image
            src={right.image}
            width={2000}
            height={1300}
            alt={right.title}
            priority={true}
            className="duration-1000 group-hover:scale-110 transition-transform"
          />
        </div>
        <div className="banner-content absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-black/20 rounded-xl">
          <div className="heading2 text-white text-center px-4">
            {right.title}
          </div>
          {right.subtitle && (
            <div className="body1 text-white text-center mt-2 px-4">
              {right.subtitle}
            </div>
          )}
          <div className="text-button text-white relative inline-block pb-1 border-b-2 border-white duration-500 mt-2 group-hover:pb-2">
            {right.cta_text}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Banner;
