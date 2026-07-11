"use client";

import React from "react";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";

const PrivacyPolicy = () => {
  return (
    <>
      <TopNavOne props="style-one bg-black" />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Privacy Policy" subHeading="Privacy Policy" />
      </div>

      <div className="privacy-policy-block md:py-20 py-10">
        <div className="container">
          <div className="max-w-[900px] mx-auto">
            <div className="heading3">Privacy Policy</div>
            <div className="body1 text-secondary mt-3">
              Last updated: July 8, 2026
            </div>

            <div className="mt-10 flex flex-col gap-6">
              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <p className="body1 text-secondary">
                  Welcome to <span className="text-title font-semibold">MOSSIM</span>.
                  Your privacy is important to us. This Privacy Policy explains
                  how we collect, use, store, and protect your information when
                  you visit our website, place an order, or use our services.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">1. Information We Collect</div>
                <p className="body1 text-secondary mt-3">
                  When you use MOSSIM, we may collect your name, phone number,
                  email address, delivery address, order details, payment-related
                  information, and customer support information. We may also
                  collect basic technical data such as browser type, device
                  information, IP address, and website usage data.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">2. How We Use Your Information</div>
                <p className="body1 text-secondary mt-3">
                  We use your information to process orders, confirm delivery,
                  contact you about your purchase, provide customer support,
                  improve our website and services, prevent fraud, and send
                  updates or offers when allowed.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">3. Order and Delivery Information</div>
                <p className="body1 text-secondary mt-3">
                  To complete your order, we may share necessary information such
                  as your name, phone number, address, and order details with
                  courier services, delivery partners, suppliers, or payment
                  service providers. We only share the information required to
                  complete the service.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">4. Payment Information</div>
                <p className="body1 text-secondary mt-3">
                  MOSSIM does not store your full card, bank, mobile banking, or
                  sensitive payment credentials. Payments may be processed by
                  third-party payment providers, and their own privacy policies
                  may apply.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">5. Cookies and Tracking</div>
                <p className="body1 text-secondary mt-3">
                  Our website may use cookies or similar technologies to improve
                  your browsing experience, remember preferences, analyze website
                  traffic, and support marketing activities. You can disable
                  cookies from your browser settings, but some features may not
                  work properly.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">6. Data Security</div>
                <p className="body1 text-secondary mt-3">
                  We take reasonable steps to protect your personal information
                  from unauthorized access, misuse, loss, or disclosure. However,
                  no online platform can guarantee complete security.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">7. Data Retention</div>
                <p className="body1 text-secondary mt-3">
                  We keep your information only as long as necessary for order
                  processing, customer support, legal, accounting, or business
                  purposes. When your information is no longer needed, we may
                  delete or anonymize it.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">8. Third-Party Services</div>
                <p className="body1 text-secondary mt-3">
                  Our website may include links or integrations with third-party
                  services such as payment gateways, courier services, analytics
                  tools, or social media platforms. We are not responsible for
                  the privacy practices of those third parties.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">9. Your Rights</div>
                <p className="body1 text-secondary mt-3">
                  You may contact us to request access, correction, or deletion
                  of your personal information, subject to legal, security, and
                  business requirements.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">10. Children’s Privacy</div>
                <p className="body1 text-secondary mt-3">
                  MOSSIM is not intended for children under the age of 13. We do
                  not knowingly collect personal information from children. If we
                  become aware that such information has been collected, we will
                  take steps to remove it.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">11. Changes to This Privacy Policy</div>
                <p className="body1 text-secondary mt-3">
                  We may update this Privacy Policy from time to time. Any
                  changes will be posted on this page with an updated “Last
                  updated” date.
                </p>
              </div>

              <div className="policy-item px-7 py-6 rounded-[20px] border border-line">
                <div className="heading5">12. Contact Us</div>
                <p className="body1 text-secondary mt-3">
                  If you have any questions about this Privacy Policy, please
                  contact us:
                </p>

                <div className="mt-4 body1 text-secondary">
                  <p>
                    <span className="text-title font-semibold">MOSSIM</span>
                  </p>
                  <p>Phone: +88 01322-447700</p>
                  <p>Email: info@mossim.net</p>
                  <p>Website: https://mossim.net</p>
                  <p>
                    Address: 01 (Kha), Block #A, House No. 14, Road No. 2/Ka/A,
                    Chattogram 4203
                  </p>
                </div>
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