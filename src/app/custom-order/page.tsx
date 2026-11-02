"use client";

import React from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import Loading from "@/components/Other/Loading";
import { useAuth } from "@/context/AuthContext";
import CustomOrderWizard from "@/components/CustomOrder/CustomOrderWizard";

export default function CustomOrderPage() {
  const { loading } = useAuth();

  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Custom Order" subHeading="Custom Order" />
      </div>

      <div className="custom-order-block md:py-16 py-10">
        <div className="container">
          <p className="body1 text-secondary text-center mb-8">
            Create your perfect fit with custom measurements.
          </p>
          {loading ? <Loading /> : <CustomOrderWizard />}
        </div>
      </div>

      <Footer />
    </>
  );
}
