"use client";
import React from "react";
import Link from "next/link";
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface Props {
  props: string;
  slogan?: string; // kept optional for backward compatibility
}

const TopNavOne: React.FC<Props> = ({ props }) => {
  return (
    <div className={`top-nav md:h-[44px] h-[30px] ${props}`}>
      <div className="container mx-auto h-full">
        <div className="top-nav-main flex justify-between max-md:justify-center h-full items-center gap-4">
          {/* Left — Helpline */}
          <div className="left-content flex items-center gap-2 max-md:hidden flex-shrink-0">
            <Icon.PhoneCall size={16} color="#fff" />
            <span className="caption2 text-white whitespace-nowrap">
              Helpline: +880 1332-447700
            </span>
          </div>

          {/* Center — Slogans */}
          <div className="text-center text-button-uppercase text-white flex items-center gap-3 flex-1 justify-center">
            <span>Welcome to MOSSIM</span>
          </div>

          {/* Right — Socials */}
          <div className="right-content flex items-center gap-5 max-md:hidden flex-shrink-0">
            <Link href={"https://www.facebook.com/"} target="_blank" rel="noopener noreferrer">
              <i className="icon-facebook text-white"></i>
            </Link>
            <Link href={"https://www.instagram.com/"} target="_blank" rel="noopener noreferrer">
              <i className="icon-instagram text-white"></i>
            </Link>
            <Link href={"https://wa.me/8801322447700"} target="_blank" rel="noopener noreferrer">
              <Icon.WhatsappLogo size={18} color="#ffffff" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavOne;