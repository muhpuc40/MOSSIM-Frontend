import React from "react";
import Link from "next/link";
import Image from "next/image";
import * as Icon from "@phosphor-icons/react/dist/ssr";

const Footer = () => {
  return (
    <>
      <div id="footer" className="footer">
        <div className="footer-main bg-surface">
          <div className="container">
            <div className="content-footer md:py-[60px] pt-10 pb-3 flex justify-between flex-wrap gap-y-8">
              <div className="company-infor basis-1/4 max-lg:basis-full pr-7">
                <Link href={"/"} className="logo">
                  <div className="heading4">MOSSIM</div>
                </Link>
                <div className="flex gap-3 mt-3">
                  <div className="flex flex-col ">
                    <span className="text-button">Mail:</span>
                    <span className="text-button mt-3">Phone:</span>
                    <span className="text-button mt-3">Address:</span>
                  </div>
                  <div className="flex flex-col ">
                    <span className="">info@mossim.net</span>
                    <span className="mt-3">+88 01322-447700</span>
                    <span className="mt-3 pt-px">
                      01 (Kha), Block #A, House No, 14 Rd NO - 2/K/A, Chattogram
                      4203
                    </span>
                  </div>
                </div>
              </div>
              <div className="right-content flex flex-wrap gap-y-8 basis-3/4 max-lg:basis-full">
                <div className="list-nav flex justify-between basis-2/3 max-md:basis-full gap-4">
                  <div className="item flex flex-col basis-1/3 ">
                    <div className="text-button-uppercase pb-3">Infomation</div>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit"
                      href={"/contact"}>
                      Contact us
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/about-us"}>
                      About Us
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/my-account"}>
                      My Account
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/order-tracking"}>
                      Order Track
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/payment-info"}>
                      Payment Info
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/developers"}>
                      Developers
                    </Link>
                  </div>
                  <div className="item flex flex-col basis-1/3 ">
                    <div className="text-button-uppercase pb-3">Quick Shop</div>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit"
                      href={"/shop?type=women"}>
                      Women
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/shop?type=man"}>
                      Men
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/shop?type=kids"}>
                      Kids
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/shop?type=unisex"}>
                      Unisex
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/shop"}>
                      All Products
                    </Link>
                  </div>
                  <div className="item flex flex-col basis-1/3 ">
                    <div className="text-button-uppercase pb-3">
                      Customer Services
                    </div>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit"
                      href={"/faqs"}>
                      Orders FAQs
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/store-list"}>
                      Store List
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/privacy-policy"}>
                      Privacy Policy
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/return-refund"}>
                      Return & Refund
                    </Link>
                    <Link
                      className="caption1 has-line-before duration-300 w-fit pt-2"
                      href={"/terms-of-use"}>
                      Terms of Use
                    </Link>
                  </div>
                </div>
                <div className="newsletter basis-1/3 pl-7 max-md:basis-full max-md:pl-0">
                  <div className="text-button-uppercase">Newletter</div>
                  <div className="caption1 mt-3">
                    Sign up for our newsletter and get your first purchase
                  </div>
                  <div className="input-block w-full h-[52px] mt-4">
                    <form className="w-full h-full relative" action="post">
                      <input
                        type="email"
                        placeholder="Enter your e-mail"
                        className="caption1 w-full h-full pl-4 pr-14 rounded-xl border border-line"
                        required
                      />
                      <button className="w-[44px] h-[44px] bg-black flex items-center justify-center rounded-xl absolute top-1 right-1">
                        <Icon.ArrowRight size={24} color="#fff" />
                      </button>
                    </form>
                  </div>
                  <div className="list-social flex items-center justify-center md:justify-start gap-3 mt-3 w-full">
                    <Link
                      href={"https://www.facebook.com/mossimbd"}
                      target="_blank">
                      <div className="icon-facebook text-2xl text-black"></div>
                    </Link>
                    <Link
                      href={"https://www.instagram.com/mossimbd/"}
                      target="_blank">
                      <div className="icon-instagram text-2xl text-black"></div>
                    </Link>
                    <Link
                      href={"https://wa.me/8801322447700"}
                      target="_blank"
                      aria-label="Chat on WhatsApp">
                      <Icon.WhatsappLogo size={24} color="#000000" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-bottom pt-3 pb-20 md:pb-3 flex items-center justify-between gap-2 max-lg:justify-center max-lg:flex-col border-t border-line">
              <div className="left flex items-center gap-8">
                <div className="copyright caption1 text-secondary">
                  © 2026 MOSSIM All Rights Reserved
                </div>
                {/* <div className="select-block flex items-center gap-5 max-md:hidden">
                                    <div className="choose-language flex items-center gap-1.5">
                                        <select name="language" id="chooseLanguageFooter" className='caption2 bg-transparent'>
                                            <option value="English">English</option>
                                            <option value="Espana">Espana</option>
                                            <option value="France">France</option>
                                        </select>
                                        <Icon.CaretDown size={12} color='#1F1F1F' />
                                    </div>
                                    <div className="choose-currency flex items-center gap-1.5">
                                        <select name="currency" id="chooseCurrencyFooter" className='caption2 bg-transparent'>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                        <Icon.CaretDown size={12} color='#1F1F1F' />
                                    </div>
                                </div> */}
              </div>
              <div className="right flex items-center gap-2">
                <div className="caption1 text-secondary">We Accept</div>
                <div className="payment-img">
                  <Image
                    src={"/images/payment/visa.png"}
                    width={500}
                    height={500}
                    alt={"payment"}
                    className="w-9"
                  />
                </div>
                <div className="payment-img">
                  <Image
                    src={"/images/payment/mastercard.png"}
                    width={500}
                    height={500}
                    alt={"payment"}
                    className="w-9"
                  />
                </div>
                <div className="payment-img">
                  <Image
                    src={"/images/payment/bkash.png"}
                    width={500}
                    height={500}
                    alt={"payment"}
                    className="w-9"
                  />
                </div>
                <div className="payment-img">
                  <Image
                    src={"/images/payment/nagad.png"}
                    width={500}
                    height={500}
                    alt={"payment"}
                    className="w-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
