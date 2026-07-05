"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";

const Developers = () => {
  const profile = {
    name: "Minhaj Uddin Hassan",
    title:
      "Bachelor of Science (Engineering) in Computer Science and Engineering",
    avatar: "/images/developers/minhaj.webp",
    bio: "Software Engineer",
    socials: [
      {
        label: "Portfolio",
        value: "muhpuc40.github.io/Minhaj-Uddin-Hassan",
        href: "https://muhpuc40.github.io/Minhaj-Uddin-Hassan/",
        icon: Icon.Globe,
        bgColor: "#2563eb",
        hoverBg: "#1d4ed8",
      },
      {
        label: "LinkedIn",
        value: "linkedin.com/in/minhajuddinhassan",
        href: "https://www.linkedin.com/in/minhajuddinhassan/",
        icon: Icon.LinkedinLogo,
        bgColor: "#0a66c2",
        hoverBg: "#004182",
      },
    ],
  };

  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Developer" subHeading="Developer" />
      </div>

      <div className="developer-page md:py-20 py-10">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="profile-card p-8 md:p-12 rounded-3xl border border-line bg-white">
              {/* ── Two column layout ── */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {/* ── LEFT: Profile ── */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  {/* Avatar - Increased size */}
                  <div className="avatar relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-line shadow-xl flex-shrink-0">
                    <Image
                      src={profile.avatar}
                      alt={profile.name}
                      fill
                      sizes="(max-width: 768px) 224px, 256px"
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Name + title */}
                  <div className="heading3 mt-6">{profile.name}</div>
                  <div className="caption1 text-secondary mt-3 max-w-xl">
                    {profile.title}
                  </div>

                  {/* Bio */}
                  <div className="body1 text-secondary2 mt-6 max-w-2xl leading-relaxed">
                    {profile.bio}
                  </div>
                </div>

                {/* ── RIGHT: Connect With Me ── */}
                <div className="flex flex-col justify-center">
                  <div className="heading5 text-center md:text-left">
                    Connect With Me
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    {profile.socials.map((social, index) => {
                      const SocialIcon = social.icon;
                      return (
                        <Link
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-item flex items-center gap-4 p-4 rounded-xl border border-line bg-white transition-all duration-300 hover:shadow-lg"
                          style={{
                            backgroundColor: "#fff",
                            color: social.bgColor,
                            borderColor: "#e5e7eb",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              social.bgColor;
                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.borderColor = social.bgColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#fff";
                            e.currentTarget.style.color = social.bgColor;
                            e.currentTarget.style.borderColor = "#e5e7eb";
                          }}>
                          <div
                            className="icon-wrapper w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                            style={{
                              backgroundColor: social.bgColor,
                              color: "#fff",
                            }}
                            onMouseEnter={(e) => {
                              // Icon background becomes white on hover
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.color = social.bgColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                social.bgColor;
                              e.currentTarget.style.color = "#fff";
                            }}>
                            <SocialIcon size={24} weight="bold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="caption2 uppercase opacity-70"
                              style={{ color: "inherit" }}>
                              {social.label}
                            </div>
                            <div
                              className="text-button truncate text-sm"
                              style={{ color: "inherit" }}>
                              {social.value}
                            </div>
                          </div>
                          <Icon.ArrowUpRight
                            size={18}
                            weight="bold"
                            className="flex-shrink-0 opacity-50 transition-all duration-300"
                          />
                        </Link>
                      );
                    })}
                  </div>
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

export default Developers;
