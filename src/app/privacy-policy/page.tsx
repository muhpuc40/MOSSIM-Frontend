"use client";

import React from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";

const infoCards = [
  {
    icon: <Icon.ShieldCheck size={28} />,
    title: "Safe & Secure",
    desc: "We take reasonable steps to protect your personal information.",
  },
  {
    icon: <Icon.UserCircle size={28} />,
    title: "Customer Privacy",
    desc: "Your personal data is used only for orders, support, and service improvement.",
  },
  {
    icon: <Icon.LockKey size={28} />,
    title: "Protected Data",
    desc: "We do not store sensitive payment credentials on our platform.",
  },
];

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We may collect your name, phone number, email address, delivery address, order details, and customer support information when you use MOSSIM. We may also collect basic technical information such as device type, browser information, IP address, and usage data.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use your information to process your orders, confirm deliveries, contact you about purchases, provide customer support, improve our services, prevent fraud, and send updates or promotional messages where permitted.",
  },
  {
    title: "3. Sharing of Information",
    content:
      "To complete your order, we may share necessary customer information with courier services, delivery partners, suppliers, or payment-related service providers. We only share information required to provide the service.",
  },
  {
    title: "4. Payment Information",
    content:
      "We do not store your full card details, banking credentials, or mobile financial service PINs. Online payments, if applicable, are handled by third-party payment providers under their own policies.",
  },
  {
    title: "5. Cookies & Tracking",
    content:
      "Our website may use cookies and similar technologies to improve browsing experience, remember preferences, analyze site usage, and support marketing activities. You may disable cookies from your browser settings if you prefer.",
  },
  {
    title: "6. Data Security",
    content:
      "We take commercially reasonable security measures to protect your information from unauthorized access, loss, misuse, or disclosure. However, no online system can be guaranteed 100% secure.",
  },
  {
    title: "7. Data Retention",
    content:
      "We keep personal information only as long as needed for order fulfillment, customer support, legal obligations, and internal recordkeeping. When no longer needed, we may delete or anonymize the data.",
  },
  {
    title: "8. Third-Party Links & Services",
    content:
      "Our website may contain links to third-party services such as social media platforms, courier companies, or payment providers. We are not responsible for the privacy practices of those third parties.",
  },
  {
    title: "9. Your Rights",
    content:
      "You may contact us to request correction, update, or deletion of your personal information, subject to legal and operational requirements.",
  },
  {
    title: "10. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated effective date.",
  },
];

const PrivacyPolicy = () => {
  return (
    <>
      <TopNavOne props="style-one bg-black" />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Privacy Policy" subHeading="Privacy Policy" />
      </div>

      <div className="md:py-20 py-10">
        <div className="container">
          <div className="max-w-[1100px] mx-auto">
            {/* Intro */}
            <div className="text-center max-w-[760px] mx-auto">
              <div className="heading3">Your Privacy Matters</div>
              <div className="body1 text-secondary mt-4">
                At <span className="text-title font-semibold">MOSSIM</span>, we
                value your trust. This Privacy Policy explains how we collect,
                use, and protect your personal information when you browse our
                website, place an order, or contact our support team.
              </div>
              <div className="caption1 text-secondary mt-3">
                Effective Date: July 13, 2026
              </div>
            </div>

            {/* Top cards */}
            <div className="grid md:grid-cols-3 gap-5 mt-10">
              {infoCards.map((item, index) => (
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

            {/* Main sections */}
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

              {/* Sidebar */}
              <div className="flex flex-col gap-5">
                <div className="rounded-[24px] border border-line bg-surface px-7 py-6">
                  <div className="heading5">
                    What We Usually Use Your Data For
                  </div>
                  <ul className="mt-4 flex flex-col gap-3">
                    <li className="body1 text-secondary flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Order processing and delivery support
                    </li>
                    <li className="body1 text-secondary flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Customer care and service communication
                    </li>
                    <li className="body1 text-secondary flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Fraud prevention and account security
                    </li>
                    <li className="body1 text-secondary flex items-start gap-3">
                      <Icon.CheckCircle size={20} className="mt-1 shrink-0" />
                      Website performance and experience improvement
                    </li>
                  </ul>
                </div>

                <div className="rounded-[24px] border border-line bg-black text-white px-7 py-6">
                  <div className="heading5">Need Help?</div>
                  <div className="body2 text-white/80 mt-3">
                    If you have any questions regarding privacy, personal data,
                    or account-related issues, please contact us directly.
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

            {/* Bottom note */}
            <div className="rounded-[24px] border border-line bg-surface px-7 py-6 mt-8">
              <div className="heading6">Important Note</div>
              <div className="body1 text-secondary mt-3">
                By using our website, placing orders, or contacting our support
                team, you agree to this Privacy Policy. If you do not agree with
                this policy, please discontinue use of the service.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;
