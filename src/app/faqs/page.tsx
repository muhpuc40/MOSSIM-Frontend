"use client";
import React, { useState } from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";

/* ── FAQ data ───────────────────────────────────────────── */
const FAQ_DATA: Record<string, { q: string; a: string }[]> = {
  "how to buy": [
    {
      q: "How do I place an order on MOSSIM?",
      a: 'Browse our shop, select the product you like, choose your preferred color and size, then click "Add to Cart". When you\'re ready, go to your cart, review the items, and click "Checkout". Fill in your shipping details and place the order — that\'s it!',
    },
    {
      q: "Do I need to create an account to buy?",
      a: "No, you can checkout as a guest. Just fill in your name, phone number, and shipping address on the checkout page and place your order. Creating an account is optional, but recommended if you want to save your details for faster future orders.",
    },
    {
      q: "Can I order multiple sizes or colors of the same product?",
      a: "Yes! Each variant (size + color combination) is treated as a separate item. You can add multiple variants of the same product to your cart and order them together.",
    },
    {
      q: "How do I know if a size is available?",
      a: "On each product page, only available sizes for the selected color are clickable. Unavailable sizes appear faded with a strikethrough. Try switching colors to see different size availability.",
    },
  ],

  "payment methods": [
    {
      q: "What payment methods do you accept?",
      a: "We accept bKash, Nagad, Bank Transfer, and Cash on Delivery (COD). Choose whichever is most convenient for you.",
    },
    {
      q: "How does payment work after I place an order?",
      a: "After you place your order, one of our representatives will call you to confirm and arrange your preferred payment method. You can pay through bKash, Nagad, bank transfer, or choose cash on delivery.",
    },
    {
      q: "Do I have to pay online before the product is delivered?",
      a: "Not always. We offer flexible payment options — you can pay online via bKash, Nagad, or bank transfer, or you can choose Cash on Delivery and pay when the product arrives (delivery charge must be paid in advance — see Delivery FAQ).",
    },
    {
      q: "Is online payment secure?",
      a: "Yes. All bKash and Nagad transactions are processed through their official secure gateways. We never store your payment credentials.",
    },
  ],

  delivery: [
    {
      q: "What are your delivery charges?",
      a: "Inside Chattogram: ৳80. Outside Chattogram: ৳120. Orders above ৳10,000 qualify for free shipping anywhere in Bangladesh.",
    },
    {
      q: "How does delivery work?",
      a: "To deliver a product, you must first pay the delivery charge. Once that's confirmed, we ship the product and the remaining amount can be collected as Cash on Delivery.",
    },
    {
      q: "How long will it take to receive my order?",
      a: "Inside Chattogram: 1–2 business days. Outside Chattogram: 2–5 business days, depending on your location.",
    },
    {
      q: "Can I track my order?",
      a: "Yes. Once your order is shipped, our representative will share the tracking details with you over phone or SMS.",
    },
  ],

  "exchanges & returns": [
    {
      q: "What is your exchange policy?",
      a: "You can exchange any product within a reasonable period after delivery. For exchange, you need to repay the delivery charge for the same product, and any price difference will be adjusted when exchanging for another product.",
    },
    {
      q: "Can I exchange for a different product?",
      a: "Yes. You can exchange your purchased item for any other product on our shop. The price difference (higher or lower) will be adjusted accordingly.",
    },
    {
      q: "What products are not eligible for exchange?",
      a: "Products that have been worn, washed, damaged after delivery, or are missing original tags cannot be exchanged. The product must be in its original condition.",
    },
    {
      q: "Do you offer refunds?",
      a: "We primarily offer exchanges. For specific cases (e.g. damaged on arrival or wrong item delivered), please contact our support team within 48 hours of receiving your order.",
    },
  ],

  registration: [
    {
      q: "Why should I register an account?",
      a: "After registering, you become a valued customer for us. Stay connected to receive regular offers, exclusive discounts, early access to new collections, and a faster checkout experience.",
    },
    {
      q: "How do I register?",
      a: 'Click the Login icon in the top menu and select "Register". Fill in your name, email, phone number, and a password — and you\'re in!',
    },
    {
      q: "Will I get notified about new offers?",
      a: "Yes. Registered customers receive email and SMS notifications about new arrivals, discounts, and seasonal sales.",
    },
    {
      q: "How do I update my profile or addresses?",
      a: 'Log in to your account and visit "My Account" — you can update your personal information, manage shipping addresses, and view your order history.',
    },
  ],

  "look after your garments": [
    {
      q: "Can I see your products in person before buying?",
      a: "Yes! You're welcome to visit our display center: 01 (Kha), Block #A, House No. 14, Road No. 2/Ka/A, Chattogram 4203. See and feel our products before deciding.",
    },
    {
      q: "How should I wash my garments?",
      a: "Always follow the care label inside each garment. As a general rule, wash similar colors together, use cold water, and avoid harsh detergents to keep the fabric looking new for longer.",
    },
    {
      q: "How do I store my clothes properly?",
      a: "Hang structured items like jackets and shirts. Fold heavy knits and sweaters to prevent stretching. Keep clothes in a cool, dry place away from direct sunlight.",
    },
    {
      q: "Can I iron my garments?",
      a: "Yes, but check the care label first. Most cotton and linen products can be ironed on medium-to-high heat. Delicate fabrics should be ironed on low heat or with a cloth in between.",
    },
  ],

  contacts: [
    {
      q: "How can I contact you?",
      a: "Email: info@mossim.net  |  Phone: +88 01322-447700  |  Visit us at: 01 (Kha), Block #A, House No. 14, Road No. 2/Ka/A, Chattogram 4203.",
    },
    {
      q: "What are your customer support hours?",
      a: "Our team is available Saturday to Thursday, 10:00 AM to 8:00 PM. We respond to emails within 24 hours on business days.",
    },
    {
      q: "How can I share feedback or report an issue?",
      a: "We'd love to hear from you. Send your feedback, complaint, or suggestion to info@mossim.net, or call us directly at +88 01322-447700.",
    },
    {
      q: "Are you on social media?",
      a: "Yes! Follow us on Facebook and Instagram (@mossim) for daily updates, styling tips, and exclusive social-only offers.",
    },
  ],
};

const TABS = [
  "how to buy",
  "payment methods",
  "delivery",
  "exchanges & returns",
  "registration",
  "look after your garments",
  "contacts",
];

const Faqs = () => {
  const [activeTab, setActiveTab] = useState<string>("how to buy");
  const [activeQuestion, setActiveQuestion] = useState<string | undefined>("");

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab);
    setActiveQuestion(""); // collapse all open Qs when switching tabs
  };

  const handleActiveQuestion = (questionKey: string) => {
    setActiveQuestion((prev) =>
      prev === questionKey ? undefined : questionKey,
    );
  };

  const currentQuestions = FAQ_DATA[activeTab] ?? [];

  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="FAQs" subHeading="FAQs" />
      </div>
      <div className="faqs-block md:py-20 py-10">
        <div className="container">
          <div className="flex justify-between max-md:flex-col gap-y-6">
            {/* ── Tab menu ────────────────── */}
            <div className="left md:w-1/4 w-full">
              <div className="menu-tab flex flex-col gap-5 max-md:flex-row max-md:flex-wrap">
                {TABS.map((item, index) => (
                  <div
                    key={index}
                    className={`tab-item inline-block w-fit heading6 has-line-before text-secondary2 hover:text-black duration-300 cursor-pointer ${activeTab === item ? "active" : ""}`}
                    onClick={() => handleActiveTab(item)}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Questions for active tab ─── */}
            <div className="right md:w-2/3 w-full">
              <div className="tab-question flex flex-col gap-5 active">
                {currentQuestions.map((qa, index) => {
                  const key = `${activeTab}-${index}`;
                  const isOpen = activeQuestion === key;
                  return (
                    <div
                      key={key}
                      className={`question-item px-7 py-5 rounded-[20px] overflow-hidden border border-line cursor-pointer ${isOpen ? "open" : ""}`}
                      onClick={() => handleActiveQuestion(key)}>
                      <div className="heading flex items-center justify-between gap-6">
                        <div className="heading6">{qa.q}</div>
                        <Icon.CaretRight size={24} />
                      </div>
                      <div className="content body1 text-secondary">{qa.a}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Faqs;
