"use client";
import React, { Suspense } from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import SliderOne from "@/components/Slider/SliderOne";
import WhatNewOne from "@/components/Home1/WhatNewOne";
import Collection from "@/components/Home1/Collection";
import TabFeatures from "@/components/Home1/TabFeatures";
import Banner from "@/components/Home1/Banner";
import Benefit from "@/components/Home1/Benefit";
import Footer from "@/components/Footer/Footer";
import ModalNewsletter from "@/components/Modal/ModalNewsletter";

/* Section-level skeleton fallback for sections that fetch from API */
const SectionSkeleton = ({ height = "h-96" }: { height?: string }) => (
  <div className={`container mx-auto px-4 py-10`}>
    <div className={`${height} bg-surface rounded-2xl animate-pulse`} />
  </div>
);

export default function Home() {
  return (
    <>
      <TopNavOne props="style-one bg-black" />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Suspense fallback={<SectionSkeleton height="h-[600px]" />}>
          <SliderOne />
        </Suspense>
      </div>

      <Suspense fallback={<SectionSkeleton />}>
        <WhatNewOne start={0} limit={16} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-72" />}>
        <Collection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <TabFeatures start={0} limit={12} />
      </Suspense>

      <Benefit props="md:py-10 py-10" />
      <Banner />

      <Footer />
      {/* <ModalNewsletter /> */}
    </>
  );
}
