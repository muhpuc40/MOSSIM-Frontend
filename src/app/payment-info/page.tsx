import React from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import PaymentInfoContent from "@/components/Checkout/PaymentInfoContent";

const PaymentInfoPage = () => {
  return (
    <>
      <TopNavOne props="style-one bg-black" />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb
          heading="Payment Information"
          subHeading="Payment Information"
        />
      </div>

      <div className="md:py-16 py-10">
        <div className="container">
          <div className="max-w-[760px] mx-auto rounded-[28px] border border-line bg-white md:p-8 p-5">
            <div className="heading3">Payment Information</div>
            <div className="body2 text-secondary mt-2 mb-7">
              Choose MFS or bank transfer and complete your payment using the
              details below.
            </div>

            <PaymentInfoContent />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PaymentInfoPage;
