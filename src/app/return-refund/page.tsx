"use client";

import React from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";

const highlights = [
  {
    icon: <Icon.ArrowsLeftRight size={28} />,
    title: "Exchange Available",
    desc: "Damaged, wrong size, or wrong color items may be exchanged according to our policy.",
  },
  {
    icon: <Icon.Package size={28} />,
    title: "Product Condition",
    desc: "Products must be unused, unwashed, and in original condition for exchange eligibility.",
  },
  {
    icon: <Icon.Truck size={28} />,
    title: "Delivery Charge",
    desc: "For exchange requests, the delivery charge must be paid by the customer.",
  },
];

const policyPoints = [
  {
    title: "1. Exchange for Damaged Product",
    content:
      "If the product is damaged when you receive it, we will exchange the item. Please inform us as soon as possible after delivery and share clear photos or videos of the issue for verification.",
  },
  {
    title: "2. Exchange for Size Issue",
    content:
      "If the size does not fit, you may request an exchange, subject to product availability. The item must be unused, unwashed, and in original condition with tags intact.",
  },
  {
    title: "3. Exchange for Color Issue",
    content:
      "If you want to exchange the product for another color, you may do so depending on stock availability. The customer must bear the delivery charge for the exchange process.",
  },
  {
    title: "4. Customer Delivery Charge",
    content:
      "For all exchange requests, the delivery charge must be paid by the customer. If there is any additional courier cost for returning and resending the product, that cost also applies to the customer.",
  },
  {
    title: "5. Product Condition for Exchange",
    content:
      "To be accepted for exchange, the product must be unused, unwashed, free from perfume or stains, and returned with original packaging, tags, and accessories if applicable.",
  },
  {
    title: "6. Non-Exchangeable Items",
    content:
      "Products that have been used, washed, damaged after delivery, altered, or returned without original tags and packaging may not be eligible for exchange.",
  },
  {
    title: "7. Refund Policy",
    content:
      "We generally do not offer cash refunds. Our policy is mainly exchange-based. If a product is damaged or has a genuine issue from our side, we will arrange an exchange according to the policy.",
  },
  {
    title: "8. Exchange Approval",
    content:
      "All exchange requests are subject to inspection and approval by our support team. Once approved, we will guide you through the next steps.",
  },
];

const steps = [
  "Contact our support team with your order number.",
  "Explain the issue clearly and send product photos if damaged.",
  "Wait for confirmation from our team.",
  "Send or hand over the product as instructed.",
  "Pay the required delivery charge for exchange.",
  "Receive the exchanged product based on availability.",
];

const ReturnRefundPage = () => {
  return (
    <>
      <TopNavOne props="style-one bg-black" />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb
          heading="Return & Exchange Policy"
          subHeading="Return & Exchange Policy"
        />
      </div>

      <div className="md:py-20 py-10">
        <div className="container">
          <div className="max-w-[1100px] mx-auto">
            {/* Intro */}
            <div className="text-center max-w-[760px] mx-auto">
              <div className="heading3">Return & Exchange Policy</div>
              <div className="body1 text-secondary mt-4">
                At <span className="text-title font-semibold">MOSSIM</span>, we
                want you to shop with confidence. Please review our return and
                exchange policy carefully before placing an order.
              </div>
            </div>

            {/* Highlight cards */}
            <div className="grid md:grid-cols-3 gap-5 mt-10">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[24px] border border-line bg-surface px-6 py-6">
                  <div className="w-12 h-12 rounded-full bg-white border border-line flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="heading6 mt-4">{item.title}</div>
                  <div className="body2 text-secondary mt-2">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mt-10">
              {/* Left main content */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                {policyPoints.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-[24px] border border-line px-7 py-6 bg-white">
                    <div className="heading5">{item.title}</div>
                    <div className="body1 text-secondary mt-3">
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right sidebar */}
              <div className="flex flex-col gap-5">
                <div className="rounded-[24px] border border-line bg-surface px-7 py-6">
                  <div className="heading5">How to Request an Exchange</div>
                  <div className="mt-4 flex flex-col gap-4">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="min-w-8 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="body2 text-secondary">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-line bg-black text-white px-7 py-6">
                  <div className="heading5">Important Notes</div>
                  <ul className="mt-4 flex flex-col gap-3">
                    <li className="body2 text-white/80 flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Damaged products can be exchanged.
                    </li>
                    <li className="body2 text-white/80 flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Size and color exchange is allowed based on stock.
                    </li>
                    <li className="body2 text-white/80 flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Customer must pay the delivery charge.
                    </li>
                    <li className="body2 text-white/80 flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Refund is generally not applicable.
                    </li>
                  </ul>
                </div>

                <div className="rounded-[24px] border border-line px-7 py-6 bg-white">
                  <div className="heading5">Support Contact</div>
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <Icon.PhoneCall size={20} className="mt-1 shrink-0" />
                      <span className="body2 text-secondary">
                        +88 01322-447700
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon.EnvelopeSimple
                        size={20}
                        className="mt-1 shrink-0"
                      />
                      <span className="body2 text-secondary">
                        info@mossim.net
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon.MapPin size={20} className="mt-1 shrink-0" />
                      <span className="body2 text-secondary">
                        01 (Kha), Block #A, House No. 14, Road No. 2/Ka/A,
                        Chattogram 4203
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* bottom note */}
            <div className="rounded-[24px] border border-line bg-surface px-7 py-6 mt-8">
              <div className="heading6">Policy Reminder</div>
              <div className="body1 text-secondary mt-3">
                Exchange requests depend on product condition, stock
                availability, and support verification. To avoid issues, please
                check the product immediately after receiving it and contact us
                as soon as possible if any problem is found.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ReturnRefundPage;
