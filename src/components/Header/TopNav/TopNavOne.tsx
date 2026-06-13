"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface Props {
  props: string;
  slogan: string;
}

const TopNavOne: React.FC<Props> = ({ props, slogan }) => {
  const [isOpenLanguage, setIsOpenLanguage] = useState(false);
  const [isOpenCurrence, setIsOpenCurrence] = useState(false);
  const [language, setLanguage] = useState("English");
  const [currence, setCurrence] = useState("USD");

  return (
    <>
      <div className={`top-nav md:h-[44px] h-[30px] ${props}`}>
        <div className="container mx-auto h-full">
          <div className="top-nav-main flex justify-between max-md:justify-center h-full">
            <div className="left-content flex items-center gap-2 max-md:hidden">
              <Icon.PhoneCall size={16} color="#fff" />
              <span className="caption2 text-white">
                Helpline: +880 1332-447700
              </span>
            </div>
            <div className="text-center text-button-uppercase text-white flex items-center">
              {slogan}
            </div>
            <div className="right-content flex items-center gap-5 max-md:hidden">
              <Link href={"https://www.facebook.com/"} target="_blank">
                <i className="icon-facebook text-white"></i>
              </Link>
              <Link href={"https://www.instagram.com/"} target="_blank">
                <i className="icon-instagram text-white"></i>
              </Link>
              <Link href={"https://www.youtube.com/"} target="_blank">
                <i className="icon-youtube text-white"></i>
              </Link>
              <Link href={"https://twitter.com/"} target="_blank">
                <i className="icon-twitter text-white"></i>
              </Link>
              <Link href={"https://pinterest.com/"} target="_blank">
                <i className="icon-pinterest text-white"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNavOne;
