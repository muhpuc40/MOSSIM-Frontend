"use client";

import React from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";

const highlights = [
  {
    icon: <Icon.UserCheck size={28} />,
    title: "Account Responsibility",
    desc: "Keep your account information accurate and your login credentials secure.",
  },
  {
    icon: <Icon.ShoppingBag size={28} />,
    title: "Orders & Payments",
    desc: "Orders are subject to availability, verification, and successful payment or confirmation.",
  },
  {
    icon: <Icon.ShieldCheck size={28} />,
    title: "Fair Use",
    desc: "Use the website lawfully and do not misuse, disrupt, or copy our services or content.",
  },
];

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing, browsing, registering an account, or placing an order through MOSSIM, you agree to these Terms of Use. If you do not agree with these terms, please stop using the website and its services.",
  },
  {
    title: "2. Eligibility & Account Registration",
    content:
      "You must provide accurate, complete, and current information when creating an account or placing an order. You are responsible for maintaining the confidentiality of your password and for all activity performed through your account.",
  },
  {
    title: "3. Products & Availability",
    content:
      "We aim to present product descriptions, images, colors, sizes, prices, and availability as accurately as possible. Minor differences may occur because of photography, display settings, manufacturing variations, or updates. All products remain subject to stock availability.",
  },
  {
    title: "4. Pricing & Payment",
    content:
      "Prices are displayed in the applicable currency and may change without prior notice. An order may require confirmation or payment verification before acceptance. We reserve the right to correct pricing or product information errors before dispatch.",
  },
  {
    title: "5. Orders & Cancellation",
    content:
      "Submitting an order does not automatically guarantee acceptance. We may contact you to verify an order and may cancel or refuse an order because of stock issues, incorrect information, suspected fraud, delivery limitations, or other operational reasons.",
  },
  {
    title: "6. Delivery",
    content:
      "Delivery dates are estimates and may be affected by courier operations, location, weather, holidays, or events beyond our control. Customers must provide a correct delivery address and reachable contact number.",
  },
  {
    title: "7. Returns, Exchanges & Refunds",
    content:
      "Returns, exchanges, and refunds are governed by our Return & Exchange Policy. Please review that policy before placing an order. Eligibility may depend on product condition, verification, stock availability, and applicable delivery charges.",
  },
  {
    title: "8. Acceptable Use",
    content:
      "You may not use the website for unlawful, fraudulent, abusive, or harmful activities. You must not attempt unauthorized access, interfere with website operation, upload malicious code, scrape protected content, or misuse another person’s account or information.",
  },
  {
    title: "9. Intellectual Property",
    content:
      "The MOSSIM name, logo, website design, text, graphics, product presentation, photographs, and other content are owned by or licensed to MOSSIM. They may not be copied, reproduced, modified, distributed, or commercially used without written permission.",
  },
  {
    title: "10. Third-Party Services",
    content:
      "The website may use or link to third-party services such as payment providers, couriers, social media platforms, or external websites. Their services are governed by their own terms and policies, and we are not responsible for their independent actions.",
  },
  {
    title: "11. Limitation of Liability",
    content:
      "To the extent permitted by law, MOSSIM is not liable for indirect, incidental, or consequential loss arising from website interruption, third-party services, misuse of products, inaccurate customer information, or events beyond our reasonable control.",
  },
  {
    title: "12. Changes to These Terms",
    content:
      "We may update these Terms of Use when our services, policies, or legal obligations change. Updated terms will be posted on this page and will apply from the stated effective date.",
  },
];

const TermsOfUsePage = () => {
  return (
    <>
      <TopNavOne props="style-one bg-black" />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Terms of Use" subHeading="Terms of Use" />
      </div>

      <div className="md:pt-8 md:pb-20 pt-5 pb-10">
        <div className="container">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center max-w-[760px] mx-auto">
              <div className="body1 text-secondary">
                These terms explain the rules that apply when you use the
                <span className="text-title font-semibold"> MOSSIM</span>{" "}
                website, create an account, or purchase our products.
              </div>

              <div className="caption1 text-secondary mt-1">
                Effective Date: July 22, 2026
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mt-7">
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
              <div className="lg:col-span-2 flex flex-col gap-5">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className="rounded-[24px] border border-line px-7 py-6 bg-white">
                    <div className="heading5">{section.title}</div>

                    <div className="body1 text-secondary mt-3">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-5">
                <div className="rounded-[24px] border border-line bg-surface px-7 py-6">
                  <div className="heading5">Your Responsibilities</div>

                  <ul className="mt-4 flex flex-col gap-3">
                    <li className="body1 text-secondary flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Provide correct account and delivery information
                    </li>

                    <li className="body1 text-secondary flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Keep your password and account secure
                    </li>

                    <li className="body1 text-secondary flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Review product and policy information before ordering
                    </li>

                    <li className="body1 text-secondary flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Use our website only for lawful purposes
                    </li>
                  </ul>
                </div>

                <div className="rounded-[24px] border border-line bg-black text-white px-7 py-6">
                  <div className="heading5">Questions About These Terms?</div>

                  <div className="body2 text-white/80 mt-3">
                    Contact our support team for help with account, order, or
                    policy-related questions.
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <Icon.PhoneCall size={20} className="mt-1 shrink-0" />
                      <span className="body2">+88 01322-447700</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Icon.EnvelopeSimple
                        size={20}
                        className="mt-1 shrink-0"
                      />
                      <span className="body2">info@mossim.net</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Icon.MapPin size={20} className="mt-1 shrink-0" />

                      <span className="body2">
                        01 (Kha), Block #A, House No. 14, Road No. 2/Ka/A,
                        Chattogram 4203
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-line bg-surface px-7 py-6 mt-8">
              <div className="heading6">Agreement</div>

              <div className="body1 text-secondary mt-3">
                By continuing to use MOSSIM, registering an account, or placing
                an order, you confirm that you have read and accepted these
                Terms of Use together with our Privacy Policy and Return &
                Exchange Policy.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TermsOfUsePage;
