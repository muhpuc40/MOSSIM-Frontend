"use client";
import React from "react";
import Image from "next/image";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Benefit from "@/components/Home1/Benefit";
import Brand from "@/components/Home1/Brand";
import Footer from "@/components/Footer/Footer";

const AboutUs = () => {
  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="About Us" subHeading="About Us" />
      </div>
      <div className="about md:pt-20 pt-10">
        <div className="about-us-block">
          <div className="container">
            <div className="text flex items-center justify-center">
              <div className="content md:w-5/6 w-full">
                <div className="heading3 text-center">Mossim Display Shop</div>
                <div className="body1 text-center md:mt-7 mt-5">
                  We offers premium traditional fashion for men, women, kids,
                  and babies. We specialize in elegant Panjabi, Kurta, 3-piece
                  suits, and coordinated family collections, inspired by
                  Bangladeshi culture with quality fabrics and fine
                  craftsmanship. Perfect for festive, casual, and everyday
                  occasions.
                </div>
              </div>
            </div>
            <div className="flex justify-center md:pt-20 pt-10">
              <div className="w-full max-w-[350px]">
                <Image
                  src="/images/mossim.png"
                  width={1000}
                  height={1000}
                  alt="MOSSIM logo"
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Benefit props="md:pt-20 pt-10 pb-10" />
      <Footer />
    </>
  );
};

export default AboutUs;
