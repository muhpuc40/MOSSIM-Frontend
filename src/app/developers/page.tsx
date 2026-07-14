"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import * as Icon from "@phosphor-icons/react/dist/ssr";

const profile = {
  name: "Minhaj Uddin Hassan",
  role: "Software Engineer",
  education:
    "Bachelor of Science (Engineering) in Computer Science and Engineering",
  avatar: "/images/developers/minhaj.webp",
  introduction:
    "Responsible for the design, development, integration and technical implementation of the MOSSIM platform, with a focus on performance, usability, maintainability and a reliable customer experience.",
  portfolio: "https://muhpuc40.github.io/Minhaj-Uddin-Hassan/",
  linkedin: "https://www.linkedin.com/in/minhajuddinhassan/",
};
const Developers = () => {
  return (
    <>
      <TopNavOne props="style-one bg-black" />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Developer" subHeading="Developer" />
      </div>

      <main className="developer-page md:py-10 py-0">
        <div className="container">
          <div className="max-w-[1100px] mx-auto">
            <section className="mt-0 rounded-[30px] border border-line bg-white overflow-hidden">
              <div className="grid lg:grid-cols-[360px_1fr]">
                <div className="bg-surface p-8 md:p-10 flex items-center justify-center">
                  <div className="w-full text-center">
                    <div className="relative w-56 h-56 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={profile.avatar}
                        alt={profile.name}
                        fill
                        sizes="224px"
                        className="object-cover"
                        priority
                      />
                    </div>

                    <div className="heading4 mt-6">{profile.name}</div>
                    <div className="text-button text-secondary mt-2">
                      {profile.role}
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="caption1 uppercase tracking-[0.16em] text-secondary">
                    Professional Profile
                  </div>
                  <div className="heading3 mt-3">
                    Building Reliable Digital Experiences
                  </div>
                  <div className="body1 text-secondary mt-5 leading-relaxed">
                    {profile.introduction}
                  </div>

                  <div className="mt-7 pt-7 border-t border-line">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-full bg-surface flex items-center justify-center shrink-0">
                        <Icon.GraduationCap size={24} />
                      </div>
                      <div>
                        <div className="text-button">Academic Background</div>
                        <div className="body2 text-secondary mt-1">
                          {profile.education}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-8">
                    <Link
                      href={profile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-main inline-flex items-center gap-2">
                      View Portfolio
                      <Icon.ArrowUpRight size={18} weight="bold" />
                    </Link>

                    <Link
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-black text-button hover:bg-black hover:text-white duration-300">
                      <Icon.LinkedinLogo size={20} weight="fill" />
                      LinkedIn Profile
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Developers;
